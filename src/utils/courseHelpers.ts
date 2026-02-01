export function getCourseDurationHours(course: any): number {
  if (!course) {
    return 0;
  }
  
  
  const a = course.duracion_horas ?? course.duracion_horas_total ?? course.duracionHoras ?? course.duracion_h;
  if (a !== undefined && a !== null && !isNaN(Number(a))) {
    return Number(a);
  }

  
  const minutes = Number(course.duracion ?? course.duracion_minutos ?? course.duration_minutes ?? course.duracion_estimada ?? 0);
  if (!isNaN(minutes) && minutes > 0) {
    
    const hours = Math.round((minutes / 60) * 10) / 10;
    return hours;
  }

  
  const anyNum = Number(course.duracion || course.duracion_horas || 0);
  if (!isNaN(anyNum) && anyNum > 0) {
    return anyNum;
  }
  return 0;
}

export function getCourseDurationText(course: any): string | undefined {
  if (!course) return undefined;
  
  const minutesRaw = Number(course.duracion ?? course.duracion_minutos ?? course.duration_minutes ?? course.duracion_estimada ?? NaN);
  if (!isNaN(minutesRaw) && minutesRaw > 0) {
    const minutes = Math.round(minutesRaw);
    if (minutes < 60) return `${minutes} min`;
    const hrs = Math.floor(minutes / 60);
    const rem = minutes % 60;
    return rem === 0 ? `${hrs} h` : `${hrs} h ${rem} min`;
  }

  
  const hours = getCourseDurationHours(course);
  if (!hours || hours === 0) return undefined;
  if (hours < 1) {
    
    const mins = Math.round(hours * 60);
    return `${mins} min`;
  }
  const whole = Math.floor(hours);
  const frac = Math.round((hours - whole) * 60);
  return frac === 0 ? `${whole} h` : `${whole} h ${frac} min`;
}