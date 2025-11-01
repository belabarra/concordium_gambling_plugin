//! # Payout Smart Contract
//! 
//! Automated payout contract for gambling winnings on Concordium blockchain.
//! This contract ensures trustless, transparent, and automated payouts to winners.

use concordium_std::*;

/// Contract state
#[derive(Serialize, SchemaType, Clone)]
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

/// Contract errors
#[derive(Debug, PartialEq, Eq, Reject, Serial, SchemaType)]
pub enum ContractError {
    /// Parsing failed
    #[from(ParseError)]
    ParseError,
    /// Only owner can perform this action
    Unauthorized,
}

/// Payout winnings to winner
#[receive(
    contract = "payout_contract",
    name = "payout",
    parameter = "PayoutParams",
    error = "ContractError",
    mutable
)]
fn payout(
    ctx: &ReceiveContext,
    host: &mut Host<State>,
) -> Result<(), ContractError> {
    // Only owner can trigger payouts
    ensure!(
        ctx.sender().matches_account(&host.state().owner),
        ContractError::Unauthorized
    );

    // Parse parameters
    let params: PayoutParams = ctx.parameter_cursor().get()?;

    // Transfer funds to winner
    host.invoke_transfer(&params.winner, params.amount)
        .map_err(|_| ContractError::Unauthorized)?;

    // Update total payouts
    host.state_mut().total_payouts += params.amount;

    Ok(())
}

/// View total payouts
#[receive(contract = "payout_contract", name = "view", return_value = "Amount")]
fn view(_ctx: &ReceiveContext, host: &Host<State>) -> ReceiveResult<Amount> {
    Ok(host.state().total_payouts)
}
