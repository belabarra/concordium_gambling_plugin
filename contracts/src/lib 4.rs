//! # Payout Smart Contract
//! 
//! Automated payout contract for gambling winnings on Concordium blockchain.
//! This contract ensures trustless, transparent, and automated payouts to winners.

use concordium_std::*;

/// Contract state
#[derive(Serialize, SchemaType)]
pub struct State {
    /// Platform owner address (who can trigger payouts)
    pub owner: AccountAddress,
    /// Total payouts processed
    pub total_payouts: Amount,
}

/// Initialize contract with owner
#[init(contract = "payout_contract")]
fn init(ctx: &InitContext, _state_builder: &mut StateBuilder) -> InitResult<State> {
    Ok(State {
        owner: ctx.init_origin(),
        total_payouts: Amount::zero(),
    })
}

/// Parameters for payout
#[derive(Serialize, SchemaType)]
pub struct PayoutParams {
    /// Winner's address
    pub winner: AccountAddress,
    /// Amount to payout
    pub amount: Amount,
    /// Game ID for tracking
    pub game_id: String,
}

/// Payout winnings to winner
#[receive(
    contract = "payout_contract",
    name = "payout",
    parameter = "PayoutParams",
    mutable
)]
fn payout(
    ctx: &ReceiveContext,
    host: &mut Host<State>,
) -> ReceiveResult<()> {
    // Only owner can trigger payouts
    ensure!(
        ctx.sender().matches_account(&host.state().owner),
        ContractError::Unauthorized.into()
    );

    // Parse parameters
    let params: PayoutParams = ctx.parameter_cursor().get()?;

    // Transfer funds to winner
    host.invoke_transfer(&params.winner, params.amount)?;

    // Update total payouts
    host.state_mut().total_payouts += params.amount;

    Ok(())
}

/// View total payouts
#[receive(contract = "payout_contract", name = "view", return_value = "Amount")]
fn view(_ctx: &ReceiveContext, host: &Host<State>) -> ReceiveResult<Amount> {
    Ok(host.state().total_payouts)
}

/// Contract errors
#[derive(Debug, PartialEq, Eq, Reject, Serialize, SchemaType)]
pub enum ContractError {
    /// Only owner can perform this action
    #[from(ParseError)]
    ParseError,
    Unauthorized,
}

#[concordium_cfg_test]
mod tests {
    use super::*;
    use concordium_std::test_infrastructure::*;

    #[concordium_test]
    fn test_init() {
        let ctx = TestInitContext::empty();
        let mut state_builder = TestStateBuilder::new();
        
        let state = init(&ctx, &mut state_builder).expect("Init should succeed");
        
        claim_eq!(state.total_payouts, Amount::zero());
    }

    #[concordium_test]
    fn test_payout() {
        let mut ctx = TestReceiveContext::empty();
        let winner = AccountAddress([1u8; 32]);
        
        let params = PayoutParams {
            winner,
            amount: Amount::from_micro_ccd(1000000),
            game_id: String::from("game_123"),
        };
        
        let parameter_bytes = to_bytes(&params);
        ctx.set_parameter(&parameter_bytes);
        
        // Test implementation would verify payout logic
    }
}
