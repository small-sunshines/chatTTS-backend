import axios, { AxiosResponse } from 'axios'
import { Router } from 'express'
import { getAccessToken, LoginCheck, sessToken } from '../api'
import { Error, Token } from '../api/LoginCheck';

const router = Router()

router.get('/getYoutubeLiveChatId', async (req, res) => {
  try {
    const token = await LoginCheck(sessToken.getToken(req))

    if ((token as Error).status === 'Please log in') {
      res.status(400)
        .json(token)
        .end()
    } else {
      if (!(token as Token).auth.google) {
        res.status(400)
          .json({
            error: true,
            status: 'is not logged in with google',
          })
          .end()
      } else {
        const accessToken = await getAccessToken.get((token as Token).auth.google.id, 'google')

        try {
          const data: AxiosResponse<IYoutubeLive> = await axios({
            method: 'GET',
            url: 'https://www.googleapis.com/youtube/v3/liveBroadcasts?' +
              'part=snippet&broadcastType=all&maxResults=5&' +
              `mine=true&key=${process.env.youtube_key}`,
            headers: {
              Authorization: `Bearer ${accessToken}`,
              Accept: 'application/json',
            },
          })

          const youtube = data.data

          const liveData: IGetYoutubeLiveChatIdData[] = []

          if (youtube.pageInfo.totalResults > 0) {
            youtube.items.forEach((value) => {
              if (value.snippet.liveChatId) {
                liveData.push({
                  title: value.snippet.title,
                  description: value.snippet.description,
                  thumbnails: value.snippet.thumbnails,
                  liveChatId: value.snippet.liveChatId,
                })
              }
            })
          }

          const payload =  {
            error: false,
            data: liveData,
          }

          res.status(200)
            .json(payload)
            .end()
        } catch (error) {
          throw error
        }
      }
    }
  } catch (error) {
    throw error
  }
})

export default router

export interface IGetYoutubeLiveChatId {
  error: false,
  data: IGetYoutubeLiveChatIdData[]
}

export interface IGetYoutubeLiveChatIdData {
  title: string,
  description: string,
  thumbnails: { [key: string]: Thumbnail },
  liveChatId: string
}

export interface IYoutubeLive {
  kind: 'youtube#liveBroadcastListResponse',
  etag: string,
  nextPageToken: string,
  prevPageToken: string,
  pageInfo: {
    totalResults: number,
    resultsPerPage: number
  },
  items: IYoutubeResource[]
}

export interface IYoutubeResource {
  kind: 'youtube#liveBroadcast',
  etag: string,
  id: string,
  snippet: {
    publishedAt: Date,
    channelID: string,
    title: string,
    description: string,
    thumbnails: { [key: string]: Thumbnail },
    scheduldStartTime: Date,
    scheduledEndTime: Date,
    actualStartTime: Date,
    actualEndTime: Date,
    isDefaultBroadcast: boolean,
    liveChatId: string
  },
  status: {
    lifeCycleStatus: string,
    privacyStatus: string,
    recordingStatus: string,
  },
  contentDetails: {
    boundStreamId: string,
    boundStreamLastUpdateTimeMs: Date,
    monitorStream: {
      enableMonitorStream: boolean,
      broadcastStreamDelayMs: number,
      embedHtml: string
    },
    enableEmbed: boolean,
    enableDvr: boolean,
    enableContentEncryption: boolean,
    startWithSlate: boolean,
    recordFromStart: boolean,
    enableClosedCaptions: boolean,
    closedCaptionsType: string,
    projection: string,
    enableLowLatency: boolean
    latencyPreference: boolean
    enableAutoStart: boolean
  },
  statistics: {
    totalChatCount: number
  }
}

export interface Thumbnail {
  url: string,
  width: number,
  height: number
}
