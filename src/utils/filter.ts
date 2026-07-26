export interface ClassFilterable {
  classId?: string;
}

export const filterByClass = <T extends ClassFilterable>(
  items: T[],
  studentClassId?: string
): T[] => {
  if (!studentClassId) return items;
  const normalizedStudentClassId = studentClassId.trim().toLowerCase();
  
  return items.filter(item => {
    // If no classId is present, treat as public (backward compatibility)
    if (!item.classId) return true;
    
    const normalizedItemClassId = item.classId.trim().toLowerCase();
    return normalizedItemClassId === normalizedStudentClassId || normalizedItemClassId === "all";
  });
};
