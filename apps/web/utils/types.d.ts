export type Streams = {
  id: string;
  type: "Youtube" | "Spotify";
  active: boolean;
  upvotes: number;
  userId: string;
  extractedId: string;
  url: string;
  largeThumbnail: string;
  smallThumbnail: string;
  title: string;
  user: {
    id: string;
    name: string | null;
  };
  addedByUser: {
    id: string;
    name: string | null;
  };
  duration: number;
  addedBy:string,
  played:boolean
};

export type Spaces = {
  id: string;
  name: string;
  streams: Stream[];
  hostId: string;
  hostName: string;
  isActive: boolean;
  currentStream?: string;
  joinees?: number;
  myvotes?: number;
  mysongs?: number;
  hosted?: boolean;
  totalStreamTime?: number;
  link: string|null;
};

export type UserStatus = {
  "total Streams Done": number;
  "total Participants": number;
  "total Streams Attended": number;
};

export type History = Spaces[];

export type Hosted = Spaces[];
