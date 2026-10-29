/** Compare the browser's Origin with the actual request Host behind the hosting proxy. */
export function isSameOrigin(request: {headers: Headers}) {
 const value=request.headers.get('origin')
 const host=request.headers.get('host')
 if(!value||!host)return false
 try {
  const origin=new URL(value)
  const protocol=request.headers.get('x-forwarded-proto')?.split(',')[0].trim()
  return ['http:','https:'].includes(origin.protocol) && origin.host===host.toLowerCase() && (!protocol||origin.protocol===protocol+':')
 } catch{return false}
}
