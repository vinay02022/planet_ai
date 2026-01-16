from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID

from app.db.database import get_db
from app.services.workflow import WorkflowExecutor
from app.schemas.workflow import (
    WorkflowCreate,
    WorkflowResponse,
    WorkflowDefinition,
    WorkflowValidation,
    WorkflowExecute,
    WorkflowExecuteResponse,
)
from app.models.workflow import Workflow

router = APIRouter()


@router.post("/validate", response_model=WorkflowValidation)
async def validate_workflow(workflow: WorkflowDefinition):
    """Validate a workflow structure."""
    executor = WorkflowExecutor()
    return executor.validate_workflow(workflow)


@router.post("/execute", response_model=WorkflowExecuteResponse)
async def execute_workflow(request: WorkflowExecute):
    """Execute a workflow with a user query."""
    executor = WorkflowExecutor()
    return await executor.execute(request.workflow, request.query)


@router.post("", response_model=WorkflowResponse)
async def create_workflow(
    workflow: WorkflowCreate,
    db: AsyncSession = Depends(get_db),
):
    """Save a workflow to the database."""
    executor = WorkflowExecutor()

    # Validate first
    validation = executor.validate_workflow(workflow.definition)

    # Create workflow record
    db_workflow = Workflow(
        name=workflow.name,
        description=workflow.description,
        definition=workflow.definition.model_dump(),
        is_valid=validation.valid,
    )

    db.add(db_workflow)
    await db.commit()
    await db.refresh(db_workflow)

    return db_workflow


@router.get("", response_model=List[WorkflowResponse])
async def list_workflows(db: AsyncSession = Depends(get_db)):
    """List all saved workflows."""
    from sqlalchemy import select

    result = await db.execute(
        select(Workflow).order_by(Workflow.created_at.desc())
    )
    workflows = result.scalars().all()
    return workflows


@router.get("/{workflow_id}", response_model=WorkflowResponse)
async def get_workflow(
    workflow_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Get a workflow by ID."""
    from sqlalchemy import select

    result = await db.execute(
        select(Workflow).where(Workflow.id == workflow_id)
    )
    workflow = result.scalar_one_or_none()

    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    return workflow


@router.put("/{workflow_id}", response_model=WorkflowResponse)
async def update_workflow(
    workflow_id: UUID,
    workflow: WorkflowCreate,
    db: AsyncSession = Depends(get_db),
):
    """Update a workflow."""
    from sqlalchemy import select

    result = await db.execute(
        select(Workflow).where(Workflow.id == workflow_id)
    )
    db_workflow = result.scalar_one_or_none()

    if not db_workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    executor = WorkflowExecutor()
    validation = executor.validate_workflow(workflow.definition)

    db_workflow.name = workflow.name
    db_workflow.description = workflow.description
    db_workflow.definition = workflow.definition.model_dump()
    db_workflow.is_valid = validation.valid

    await db.commit()
    await db.refresh(db_workflow)

    return db_workflow


@router.delete("/{workflow_id}")
async def delete_workflow(
    workflow_id: UUID,
    db: AsyncSession = Depends(get_db),
):
    """Delete a workflow."""
    from sqlalchemy import select

    result = await db.execute(
        select(Workflow).where(Workflow.id == workflow_id)
    )
    workflow = result.scalar_one_or_none()

    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    await db.delete(workflow)
    await db.commit()

    return {"message": "Workflow deleted successfully"}
