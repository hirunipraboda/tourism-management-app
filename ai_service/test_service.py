from agent.schemas import CurateRequest, UserPreferences, HumanApprovalRequest
from agent.graph import attraction_agent_graph
from main import curate_attractions, approve_attractions, get_status

def test_full_agent_workflow():
    print("================================================================")
    print("1. Testing Curation Request (Multi-Step Reasoning & Self-Validation)")
    print("================================================================")
    
    req = CurateRequest(
        destination_id="11111111-1111-1111-1111-111111111111",
        destination_name="Kandy & Cultural Triangle",
        preferences=UserPreferences(
            user_budget=50.0,
            max_duration_hours=5.0,
            categories=["Cultural", "Scenic"],
            require_accessible=True,
            notes="Morning tour preference"
        )
    )
    
    res1 = curate_attractions(req)
    print(f"Thread ID: {res1.thread_id}")
    print(f"Status: {res1.status}")
    print(f"Iteration Count: {res1.iteration_count}")
    print(f"Validation Passed: {res1.validation_result.is_valid}")
    print(f"Budget Check: {res1.validation_result.budget_pass}")
    print(f"Duration Check: {res1.validation_result.duration_pass}")
    print(f"Accessibility Check: {res1.validation_result.accessibility_pass}")
    print(f"Curated Attractions Count: {len(res1.curated_plan)}")
    
    print("\nReasoning Log Steps:")
    for entry in res1.reasoning_log:
        print(f"  • [{entry['step']}]: {entry['description']}")

    print("\nCurated Plan:")
    for item in res1.curated_plan:
        print(f"  - [{item.scheduled_time}] {item.name} ({item.category}) | Fee: ${item.entry_fee} | Dur: {item.visit_duration_minutes}m | Accessible: {item.is_accessible}")
        
    assert res1.status == "PENDING_HUMAN_APPROVAL", f"Expected PENDING_HUMAN_APPROVAL but got {res1.status}"
    assert res1.validation_result.is_valid == True, "Expected validation to pass"

    print("\n================================================================")
    print("2. Testing Human Approval (State Persistence & Graph Resume)")
    print("================================================================")
    
    approve_req = HumanApprovalRequest(
        thread_id=res1.thread_id,
        decision="APPROVE"
    )
    
    res2 = approve_attractions(approve_req)
    print(f"Updated Status: {res2.status}")
    print(f"Human Decision: {res2.human_decision}")
    
    assert res2.status == "APPROVED", f"Expected APPROVED but got {res2.status}"
    print("\n✅ Full LangGraph Agent Workflow Test Passed Successfully!")


if __name__ == "__main__":
    test_full_agent_workflow()
