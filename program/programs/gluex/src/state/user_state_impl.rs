use crate::state::*;
use anchor_lang::prelude::*;


impl TotalGoal {
    fn make_subgoals_from_str(subgoals: &str) -> Result<Vec<SubGoal>> {
        let subgoals: Vec<SubGoal> = subgoals
            .split(',')
            .take(MAXIUMUN_SUBGOALS)
            .map(|subgoal_str| {
                let fields: Vec<&str> = subgoal_str.split('-').collect();
                if fields.len() != 3 {
                    panic!("Invalid subgoal format: {}", subgoal_str);
                    // return err!(GluXError::InvalidSubgoalFormat);
                }
                let description = fields[0].to_string();
                let deadline: u64 = fields[1].parse().expect("Invalid deadline format");
                let incentive_amount: u64 = fields[2].parse().expect("Invalid incentive amount format");
                
                let desbytes: [u8; 20] = description.as_bytes().try_into().unwrap();

                SubGoal {
                    description: desbytes,
                    deadline,
                    completed: false,
                    incentive_amount,
                }
            })
            .collect();
        return Ok(subgoals);
    }

}
