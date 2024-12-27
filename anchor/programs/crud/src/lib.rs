#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod crud {
    use super::*;

    pub fn create_journal(
        ctx: Context<CreateJournal>,
        title: String,
        message: String,
    ) -> Result<()> {
        let journal = &mut ctx.accounts.journal;
        journal.owner = ctx.accounts.signer.key(); // *ctx.accounts.signer.key
        journal.title = title;
        journal.message = message;
        msg!(
            "title =  {}, owner = {}",
            journal.title,
            journal.owner.key().to_string()
        );
        Ok(())
    }

    pub fn update_journal(
        ctx: Context<UpdateJournal>,
        _title: String,
        message: String,
    ) -> Result<()> {
        let journal = &mut ctx.accounts.journal;
        journal.message = message;
        msg!(
            "nessage =  {}, owner = {}",
            journal.message,
            journal.owner.key().to_string()
        );
        Ok(())
    }

    pub fn delete_journal(_ctx: Context<CreateJournal>, _title: String) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct CreateJournal<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
    init,
    payer= signer,
    space = 8 + Journal::INIT_SPACE,
    seeds = [title.as_bytes(), signer.key().as_ref()],
    bump
  )]
    pub journal: Account<'info, Journal>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct UpdateJournal<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
    mut,
    seeds = [title.as_bytes(), signer.key().as_ref()],
    bump,
    realloc = 8 + Journal::INIT_SPACE,
    realloc::payer = signer,
    realloc::zero = true
  )]
    pub journal: Account<'info, Journal>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(title: String)]
pub struct DeleteJournal<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
      mut,
      seeds = [title.as_bytes(), signer.key().as_ref()],
      bump,
      close = signer
    )]
    pub journal: Account<'info, Journal>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(InitSpace)]
pub struct Journal {
    pub owner: Pubkey,
    #[max_len(200)]
    pub title: String,
    #[max_len(200)]
    pub message: String,
}
