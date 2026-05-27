import {
collection,
getDocs,
limit,
orderBy,
query
} from "firebase/firestore";

import { db }
from "@/firebase/config";

export interface WatchVideo {

id: string;

username: string;

caption: string;

hashtags: string[];

music: string;

verified: boolean;

video: string;

thumbnail?: string;

coins: number;

likes: number;

comments: number;

shares: number;

sponsor?: boolean;

createdAt?: number;
}

export async function
fetchWatchVideos() {

try {

const videosRef =  
  collection(  
    db,  
    "watchEarnVideos"  
  );  

const videosQuery =  
  query(  

    videosRef,  

    orderBy(  
      "createdAt",  
      "desc"  
    ),  

    limit(50)  
  );  

const snapshot =  
  await getDocs(  
    videosQuery  
  );  

const videos:  
  WatchVideo[] = [];  

snapshot.forEach(  
  (docItem) => {  

    const data =  
      docItem.data();  

    videos.push({  

      id:  
        docItem.id,  

      username:  
        data.username || "",  

      caption:  
        data.caption || "",  

      hashtags:  
        data.hashtags || [],  

      music:  
        data.music || "",  

      verified:  
        data.verified || false,  

      video:  
        data.video || "",  

      thumbnail:  
        data.thumbnail || "",  

      coins:  
        data.coins || 0,  

      likes:  
        data.likes || 0,  

      comments:  
        data.comments || 0,  

      shares:  
        data.shares || 0,  

      sponsor:  
        data.sponsor || false,  

      createdAt:  
        data.createdAt || 0  
    });  
  }  
);  

return {  

  success: true,  

  videos  
};

} catch (error) {

console.error(  
  "FETCH WATCH VIDEOS ERROR:",  
  error  
);  

return {  

  success: false,  

  videos: []  
};

}
}
