export type user={
  id:string,
  name:string|null,
  email:string,
  provider:Google
}

export enum Role{
  Streamer,
  Voter
}
export enum Provider{
  Google
}