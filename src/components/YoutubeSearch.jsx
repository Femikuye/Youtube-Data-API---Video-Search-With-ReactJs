import React, { useState, useRef } from 'react';
import axios from 'axios';
import "../assets/css/YoutubeSearch.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


export default function YoutubeSearch(){
    const keywordInput = useRef("");
    const startDate = useRef("");
    const endDate = useRef("");
    const [videosResult, setVideosResult] = useState([]);
    const [alert, setAlert] = useState({type_: "", msg: "", active: false});
    const [loading, setLoading] = useState(false);
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    const apiEndPoint = import.meta.env.VITE_YOUTUBE_API_ENDPOINT;
    const searchMaxResult = import.meta.env.VITE_YOUTUBE_API_MAX_RESULTS;
    const maxPages = import.meta.env.VITE_YOUTUBE_API_MAX_PAGES;
    const formatDate = (isoDate) => {
        const date = new Date(isoDate);
        return date.toLocaleString(); 
    };
    const numberFormater = (formatNumber) => {
        if (typeof formatNumber == undefined || formatNumber == undefined || formatNumber == "undefined"){
            return 0;
        }
        return formatNumber?.toLocaleString('en-US', { maximumFractionDigits: 0 });
    };
    const isStringEmpty = str => {
        if (typeof str === "string" && str.length === 0) {
           return true;
        } else if (str === null) {
            return true;
        } else {
            return false;
        }
    }
    const handleSearch = async () => {
        let keyword = keywordInput.current?.value;
        let dateAfter = startDate.current?.value;
        let dateBefore = endDate.current?.value;
        if(isStringEmpty(keyword)){
            setAlert({type_:"error", msg: "Please enter a keyword", active: true});
            return;
        }
        if(isStringEmpty(dateAfter)){
            setAlert({type_:"error", msg: "Please select a start date", active: true});
            return;
        }
        if(isStringEmpty(dateBefore)){
            setAlert({type_:"error", msg: "Please select a end date", active: true});
            return;
        }
        const formattedDateAfter = dateAfter ? new Date(dateAfter).toISOString() : '';
        const formattedDateBefore = dateBefore ? new Date(dateBefore).toISOString() : '';
        setLoading(true);
        let pageNumber = 0; 
        let nextPageToken = null;
        let allVideosList = [];
        let returnedVidIds = [];
        try {
            do{
                const searchResponse = await axios.get(`${apiEndPoint}search`, {
                    params: {
                      q: keyword,
                      part: 'snippet',
                      type: 'video',
                      key: apiKey,
                      publishedAfter: formattedDateAfter,
                      publishedBefore: formattedDateBefore,
                      maxResults: searchMaxResult,
                      pageToken: nextPageToken,
                    },
                }); 
                const filteredResonse = searchResponse.data.items.filter((video) => returnedVidIds.includes(video.id.videoId) == false);
                const videoIds = filteredResonse.map((video) => video.id.videoId);
                returnedVidIds.push(...videoIds);
                const videosResponse = await axios.get(`${apiEndPoint}videos`, {
                    params: {
                        part: 'statistics',
                        id: videoIds.join(','),
                        key: apiKey,
                    },
                });
                const videoDetails = videosResponse.data.items;                
                const updatedVideos = filteredResonse.map((searchResult) => {
                    const videoDetail = videoDetails.find((detail) => detail.id === searchResult.id.videoId);
                    return {
                        ...searchResult,
                        statistics: videoDetail ? videoDetail.statistics : {},
                    };
                });
                allVideosList = allVideosList.concat(updatedVideos);
                nextPageToken = searchResponse.data.nextPageToken;
                pageNumber++;
            }while(pageNumber < maxPages && nextPageToken != null);    
            setVideosResult(allVideosList);
            setLoading(false);
          } catch (error) {
            console.error('Error fetching data:', error);
            setAlert({type_:"error", msg: error.message, active: true});
            setLoading(false);
          }
          setLoading(false);
    }
    return (
    <div>
        <div style={{display: alert.active ? 'block' : 'none', }} className="alert alert-warning alert-dismissible fade show" role="alert">
            {alert.msg}
            <button onClick={() => setAlert({active: false, msg: "", type_: ""})} type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>
        <h3>Search YouTube Videos Base on Date Range and Keywords</h3>
        <div className='search-inputs'>
            <div className="form-floating mb-3">
                <input type='text' ref={keywordInput} className='form-control' id='keywordInput' placeholder='Enter Keyword' />
                <label htmlFor="keywordInput" className='form-label'>Keyword</label>
            </div>
            <div className="form-floating mb-3">
                <input type='date' ref={startDate} className='form-control' id='dateFrom'/>
                <label htmlFor="dateFrom" className="form-label">Start Date</label>
            </div>
            <div className="form-floating mb-3">
                <input type='date' ref={endDate} className='form-control' id='dateTo'/>
                <label htmlFor="dateTo" className="form-label">End Date</label>
            </div>
            <div className="mb-3 search-btn-div">
                <button onClick={handleSearch} disabled={loading} className='btn btn-danger'>{loading ? 'Please Wait' : 'Search'}</button>
            </div>           
        </div>
        <div className='row videos-container'>
            {videosResult.length > 0 && videosResult.map((video) => {
            return (<div className='col-md-4 video-single' key={video.id.videoId}>
                <div className="card">
                    <a target='_blank' href={`https://www.youtube.com/watch?v=${video.id.videoId}`}>
                        <img src={video.snippet.thumbnails.high.url} className="card-img-top" alt={video.snippet.title}/>
                    </a>
                    <div className="card-body">
                        <h4 className="card-title">{video.snippet.title.substring(0,45)}</h4>
                        <p className="card-text">{video.snippet.title.substring(0,120)}</p>
                    </div>
                    <div className="card-body">
                       <p>
                        <span className='text-default'>Published By: </span> 
                        <a href={`https://www.youtube.com/${video.snippet.channelId}`}> 
                        {video.snippet.channelTitle}
                        </a>
                       </p>
                       <p>
                        <span className='text-default'>Published Date: </span> 
                        {formatDate(video.snippet.publishedAt)}
                        </p>
                        <div className='statistics'>
                            <div><FontAwesomeIcon icon="fa-solid fa-thumbs-up" /> <span> {numberFormater(video.statistics?.likeCount)}</span></div>
                            <div><FontAwesomeIcon icon="fa-solid fa-eye" /> <span> {numberFormater(video.statistics?.viewCount)}</span></div>
                            <div><FontAwesomeIcon icon="fa-solid fa-comment" /> <span> {numberFormater(video.statistics?.commentCount)}</span></div>
                        </div>
                    </div>
                </div>
            </div>)
})}
        </div>
    </div>
    )
}

