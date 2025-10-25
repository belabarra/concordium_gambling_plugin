def validate_age(age):
    if not isinstance(age, int) or age < 18:
        raise ValueError("Age must be an integer and at least 18.")
    return True

def validate_user_id(user_id):
    if not isinstance(user_id, str) or len(user_id) == 0:
        raise ValueError("User ID must be a non-empty string.")
    return True

def validate_transaction_amount(amount):
    if not isinstance(amount, (int, float)) or amount <= 0:
        raise ValueError("Transaction amount must be a positive number.")
    return True

def validate_limit(limit):
    if not isinstance(limit, (int, float)) or limit <= 0:
        raise ValueError("Spending limit must be a positive number.")
    return True

def validate_cooldown_period(cooldown_period):
    if not isinstance(cooldown_period, int) or cooldown_period < 0:
        raise ValueError("Cooldown period must be a non-negative integer.")
    return True

def validate_self_exclusion_status(status):
    if status not in [True, False]:
        raise ValueError("Self-exclusion status must be a boolean value.")
    return True