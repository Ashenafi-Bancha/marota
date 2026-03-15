export const isMissingApprovalStatusColumnError = (error) => {
  if (!error) return false;
  const normalizedMessage = String(error.message || "").toLowerCase();
  return (
    error.code === "42703" ||
    (normalizedMessage.includes("approval_status") &&
      normalizedMessage.includes("does not exist"))
  );
};

export const withDefaultApprovedStatus = (rows = []) =>
  rows.map((item) => ({
    ...item,
    approval_status: item.approval_status || "approved",
  }));
