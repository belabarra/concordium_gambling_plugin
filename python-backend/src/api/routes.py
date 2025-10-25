from flask import Blueprint, request, jsonify
from services.user_service import UserService
from services.transaction_service import TransactionService
from services.limit_enforcement_service import LimitEnforcementService
from services.self_exclusion_service import SelfExclusionService

api = Blueprint('api', __name__)

@api.route('/register', methods=['POST'])
def register_user():
    data = request.json
    user_service = UserService()
    user = user_service.register_user(data)
    return jsonify(user), 201

@api.route('/transactions', methods=['POST'])
def track_transaction():
    data = request.json
    transaction_service = TransactionService()
    transaction = transaction_service.record_transaction(data)
    return jsonify(transaction), 201

@api.route('/limits', methods=['POST'])
def enforce_limit():
    data = request.json
    limit_service = LimitEnforcementService()
    result = limit_service.enforce_limit(data)
    return jsonify(result), 200

@api.route('/self-exclusion', methods=['POST'])
def self_exclude():
    data = request.json
    exclusion_service = SelfExclusionService()
    result = exclusion_service.add_self_exclusion(data)
    return jsonify(result), 201

@api.route('/self-exclusion/<user_id>', methods=['GET'])
def get_self_exclusion(user_id):
    exclusion_service = SelfExclusionService()
    exclusion = exclusion_service.get_self_exclusion(user_id)
    return jsonify(exclusion), 200

@api.route('/transactions/<user_id>', methods=['GET'])
def get_user_transactions(user_id):
    transaction_service = TransactionService()
    transactions = transaction_service.get_transactions(user_id)
    return jsonify(transactions), 200