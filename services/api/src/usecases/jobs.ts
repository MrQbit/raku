import prisma from "../db/client";

export async function getJob(jobId: string) {
  const job = await prisma.asyncJob.findUnique({ where: { id: jobId } });
  if (!job) {
    return { jobId, status: "not_found", error: "Job not found" };
  }
  
  return {
    jobId: job.id,
    status: job.status,
    progress: job.progress,
    result: job.resultRef ? { ref: job.resultRef } : null,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt
  };
}

export async function createJob(owner: string, payload: any, status: string = "pending") {
  const job = await prisma.asyncJob.create({
    data: {
      owner,
      status,
      payloadJson: payload
    }
  });
  
  return {
    jobId: job.id,
    status: job.status,
    createdAt: job.createdAt
  };
}

export async function updateJob(jobId: string, updates: { status?: string; progress?: number; resultRef?: string }) {
  const job = await prisma.asyncJob.update({
    where: { id: jobId },
    data: {
      ...updates,
      updatedAt: new Date()
    }
  });
  
  return {
    jobId: job.id,
    status: job.status,
    progress: job.progress,
    result: job.resultRef ? { ref: job.resultRef } : null,
    updatedAt: job.updatedAt
  };
}
