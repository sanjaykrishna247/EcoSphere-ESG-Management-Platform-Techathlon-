import asyncio
from datetime import date, datetime, timedelta, timezone

from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.models.badge import Badge
from app.models.category import Category
from app.models.challenge import Challenge
from app.models.department import Department
from app.models.emission_factor import EmissionFactor
from app.models.enums import (
    CategoryType,
    ChallengeDifficulty,
    ChallengeStatus,
    EmissionScope,
    PolicyCategory,
    SourceType,
    TransactionSourceType,
    UserRole,
)
from app.models.esg_configuration import EsgConfiguration
from app.models.esg_policy import EsgPolicy
from app.models.reward import Reward
from app.models.carbon_transaction import CarbonTransaction
from app.models.user import User


async def seed() -> None:
    async with AsyncSessionLocal() as db:
        admin = User(
            email="admin@ecosphere.com",
            password_hash=hash_password("Admin@123"),
            full_name="EcoSphere Admin",
            role=UserRole.admin,
        )
        db.add(admin)

        departments = [
            Department(name="Engineering", code="ENG"),
            Department(name="Operations", code="OPS"),
            Department(name="HR", code="HR"),
        ]
        db.add_all(departments)
        await db.flush()

        admin.department_id = departments[0].id

        categories = [
            Category(name="Community Outreach", type=CategoryType.csr_activity),
            Category(name="Volunteering", type=CategoryType.csr_activity),
            Category(name="Energy Reduction", type=CategoryType.challenge),
            Category(name="Waste Reduction", type=CategoryType.challenge),
            Category(name="Wellness", type=CategoryType.challenge),
        ]
        db.add_all(categories)

        emission_factors = [
            EmissionFactor(
                name="Grid Electricity",
                source_type=SourceType.expense,
                unit="kWh",
                co2_per_unit=0.475,
                scope=EmissionScope.scope2,
                description="Electricity consumption emission factor",
            ),
            EmissionFactor(
                name="Diesel Fuel",
                source_type=SourceType.fleet,
                unit="litre",
                co2_per_unit=2.68,
                scope=EmissionScope.scope1,
                description="Fleet diesel fuel combustion",
            ),
            EmissionFactor(
                name="Business Travel",
                source_type=SourceType.expense,
                unit="km",
                co2_per_unit=0.15,
                scope=EmissionScope.scope3,
                description="Employee business travel",
            ),
        ]
        db.add_all(emission_factors)

        policies = [
            EsgPolicy(
                title="Environmental Sustainability Policy",
                content="# Environmental Sustainability Policy\n\nOur commitment to reducing environmental impact.",
                category=PolicyCategory.environmental,
                effective_date=date.today(),
            ),
            EsgPolicy(
                title="Code of Conduct",
                content="# Code of Conduct\n\nGovernance standards for all employees.",
                category=PolicyCategory.governance,
                effective_date=date.today(),
            ),
        ]
        db.add_all(policies)

        badges = [
            Badge(name="First Step", description="Complete your first CSR activity", icon="🌱",
                  unlock_rule={"type": "csr_count", "value": 1}),
            Badge(name="Rising Star", description="Earn 100 XP", icon="⭐",
                  unlock_rule={"type": "xp_threshold", "value": 100}),
            Badge(name="Champion", description="Complete 5 challenges", icon="🏆",
                  unlock_rule={"type": "challenge_count", "value": 5}),
        ]
        db.add_all(badges)

        rewards = [
            Reward(name="Eco Water Bottle", points_required=50, stock=100),
            Reward(name="Plant a Tree", points_required=100, stock=200),
            Reward(name="Green Hoodie", points_required=500, stock=50),
        ]
        db.add_all(rewards)

        config = EsgConfiguration(org_name="EcoSphere Demo Org")
        db.add(config)

        await db.flush()

        challenge = Challenge(
            title="Reduce Desk Energy Usage",
            category_id=categories[2].id,
            description="Cut personal workstation energy usage by 10% this month.",
            xp_reward=150,
            difficulty=ChallengeDifficulty.medium,
            deadline=datetime.now(timezone.utc) + timedelta(days=30),
            status=ChallengeStatus.active,
            created_by=admin.id,
        )
        db.add(challenge)

        today = date.today()
        for i in range(12):
            month_date = date(today.year, today.month, 1) - timedelta(days=30 * i)
            db.add(
                CarbonTransaction(
                    source_type=TransactionSourceType.manual,
                    emission_factor_id=emission_factors[0].id,
                    department_id=departments[i % 3].id,
                    quantity=1000 + i * 25,
                    co2_equivalent=(1000 + i * 25) * 0.475,
                    transaction_date=month_date,
                    is_auto_calculated=False,
                    created_by=admin.id,
                )
            )

        await db.commit()
        print("Seed data created successfully.")


if __name__ == "__main__":
    asyncio.run(seed())
