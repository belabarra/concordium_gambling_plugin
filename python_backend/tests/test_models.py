import pytest
from src.models.user import User
from src.models.transaction import Transaction
from src.models.limit import Limit
from src.models.cooldown import Cooldown
from src.models.self_exclusion import SelfExclusion

def test_user_model():
    user = User(user_id=1, name="John Doe", age=30, self_exclusion_status=False)
    assert user.user_id == 1
    assert user.name == "John Doe"
    assert user.age == 30
    assert user.self_exclusion_status is False

def test_transaction_model():
    transaction = Transaction(transaction_id=1, user_id=1, amount=100.0, timestamp="2023-10-01T12:00:00Z")
    assert transaction.transaction_id == 1
    assert transaction.user_id == 1
    assert transaction.amount == 100.0
    assert transaction.timestamp == "2023-10-01T12:00:00Z"

def test_limit_model():
    limit = Limit(user_id=1, spending_limit=500.0, current_spending=200.0)
    assert limit.user_id == 1
    assert limit.spending_limit == 500.0
    assert limit.current_spending == 200.0

def test_cooldown_model():
    cooldown = Cooldown(user_id=1, cooldown_start="2023-10-01T12:00:00Z", cooldown_end="2023-10-01T14:00:00Z")
    assert cooldown.user_id == 1
    assert cooldown.cooldown_start == "2023-10-01T12:00:00Z"
    assert cooldown.cooldown_end == "2023-10-01T14:00:00Z"

def test_self_exclusion_model():
    self_exclusion = SelfExclusion(user_id=1, exclusion_status=True)
    assert self_exclusion.user_id == 1
    assert self_exclusion.exclusion_status is True