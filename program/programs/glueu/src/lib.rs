use anchor_lang::prelude::*;

declare_id!("DzZByscRszKLgwFTVM6BMtbG8aBYXfWTbSU7sa9gj5a8");

#[program]
pub mod glueu {
    use anchor_lang::solana_program::message::v0::LoadedAddresses;

    use super::*;

    pub enum Roomspace {
        LoveGame,
        GroupGame,
    } 

    pub enum Relations {
        Parents,
        Lover,
        Bosstaff,
        Partner,    // include friends
        Dao,        // stranger
    }
    
    pub enum EventType {
        HabitTraning,
        TargetAchieve,
        SurpriseTime
    }

    pub struct Action {

    }

    pub struct Event {
        pub roomspace: Roomspace,
        pub relations: Relations,
        pub event_type: EventType,
        pub issuer: LoadedAddresses,    // issuer, participant, and event_signer
        pub event_id: u64,
        pub event_data: Vec<u8>,
        pub event_signature: Vec<u8>,
        pub actions: Vec<Action>,
    }

    pub fn create_event(
        mut cx: &mut Context<'_>,
        roomspace: rooms::Roomspace,
        event_type: EventType,
        target: Option<String>,
    ) -> Json<Event> {
        let event = cx.new_event();
        event.roomspace = roomspace;
        event.event_type = event_type;
        event.target = target
    }

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
