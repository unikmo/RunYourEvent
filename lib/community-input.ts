export function clean(value: unknown, max = 3000) { return typeof value === 'string' ? value.trim().slice(0, max) : '' }
export function validUuid(value: unknown): value is string { return typeof value === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value) }
export function integer(value: unknown, min: number, max: number) { return typeof value==='number' && Number.isSafeInteger(value) && value>=min && value<=max }
export function validDate(value: unknown): value is string { return typeof value==='string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(new Date(value+'T00:00:00Z').getTime()) && new Date(value+'T00:00:00Z').toISOString().slice(0,10)===value }
export function validSeasonalNeed(b: Record<string, unknown>) {
 return clean(b.organizationName,160).length>=2 && clean(b.contactName,120).length>=2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(b.email,254)) && clean(b.city,120).length>=2 && clean(b.title,160).length>=2 && clean(b.description).length>=5 && clean(b.supervision,1500).length>=2 && validDate(b.seasonStart) && validDate(b.seasonEnd) && b.seasonEnd>=b.seasonStart && (!b.activityDate || (validDate(b.activityDate) && b.activityDate>=b.seasonStart && b.activityDate<=b.seasonEnd)) && integer(b.volunteerCount,1,500) && ['community','corporate'].includes(String(b.activityFormat)) && integer(b.hoursPerVolunteer,2,b.activityFormat==='corporate'?8:4) && integer(b.materialsBudgetCents??0,0,100000000) && typeof b.partialFunding==='boolean' && b.privacyAck===true
}

export function validSponsorEnquiry(b: Record<string, unknown>) {
 return clean(b.organizationName,160).length>=2 && clean(b.contactName,120).length>=2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(b.email,254)) && clean(b.message).length>=10 && ((b.enquiryType??'sponsorship')==='employee_project'?(integer(b.teamSize,1,500)&&integer(b.hoursPerEmployee,2,8)):(b.enquiryType==null||b.enquiryType==='sponsorship')&&integer(b.requestedHours,25,1000000)) && b.privacyAck===true && (!b.needId||validUuid(b.needId)) && (b.budgetCents==null||integer(b.budgetCents,1,100000000))
}
