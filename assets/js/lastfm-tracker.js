
			// CONFIGURATION: Swapped to your exact Last.fm handle
			const LASTFM_USER = 'davidi3s'; 
			const API_KEY = 'ba71ddbd2a35386071251c943ab2d1a5';

			async function fetchLastFMData() {
				try {
					// 1. FETCH LIVE NOW PLAYING TRACK / RECENT OVERVIEW
					const trackUrl = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${LASTFM_USER}&api_key=${API_KEY}&format=json&limit=1`;
					const trackResponse = await fetch(trackUrl);
					const trackData = await trackResponse.json();
					
					if (trackData.recenttracks && trackData.recenttracks.track) {
						const tracks = trackData.recenttracks.track;
						
						// Safety check: Does user have at least one song ever played?
						if (Array.isArray(tracks) && tracks.length > 0) {
							const currentTrack = tracks[0];
							
							document.getElementById('song-name').innerHTML = `<b>${currentTrack.name}</b>`;
							document.getElementById('artist-name').textContent = currentTrack.artist['#text'];
							
							// Handle Album Canvas Cover Processing
							const albumArtImg = document.getElementById('album-art');
							const largeImg = currentTrack.image.find(img => img.size === 'large' || img.size === 'extralarge');
							if (largeImg && largeImg['#text']) {
								albumArtImg.src = largeImg['#text'];
								albumArtImg.style.display = 'block';
							} else {
								albumArtImg.src = 'images/album_placeholder.jpg';
								albumArtImg.style.display = 'block';
							}

							// Toggle interactive visualizer nodes if streaming right now
							const isNowPlaying = currentTrack['@attr'] && currentTrack['@attr'].nowplaying === 'true';
							const dot = document.getElementById('status-dot');
							const text = document.getElementById('status-text');
							const visualizer = document.getElementById('visualizer');

							if (isNowPlaying) {
								dot.style.color = '#1ea14a';
								dot.style.animation = 'blink 2s infinite';
								text.textContent = 'CURRENTLY HEARING';
								visualizer.style.visibility = 'visible';
							} else {
								dot.style.color = '#14510c7a';
								dot.style.animation = 'none';
								text.textContent = 'RECENTLY PLAYED';
								visualizer.style.visibility = 'hidden';
							}
						} else {
							// Account fallback case if history metrics are zero
							document.getElementById('song-name').innerHTML = '<b>No recent tracks</b>';
							document.getElementById('artist-name').textContent = 'Start scrobbling music!';
							document.getElementById('album-art').src = 'images/album_placeholder.jpg';
							document.getElementById('album-art').style.display = 'block';
						}

						// Pull Historical Total Scrobbles
						const totalScrobbles = trackData.recenttracks['@attr'] ? trackData.recenttracks['@attr'].total : 0;
						document.getElementById('total-scrobbles').textContent = `${Number(totalScrobbles).toLocaleString()} plays`;
					}

					// 2. FETCH WEEKLY TRACK DATA CHART
					const weeklyTracksUrl = `https://ws.audioscrobbler.com/2.0/?method=user.getweeklytrackchart&user=${LASTFM_USER}&api_key=${API_KEY}&format=json`;
					const weeklyResponse = await fetch(weeklyTracksUrl);
					const weeklyData = await weeklyResponse.json();

					let totalWeeklyPlays = 0;
					let topTrackDisplay = 'None this week';

					if (weeklyData.weeklytrackchart && weeklyData.weeklytrackchart.track) {
						const wTracks = weeklyData.weeklytrackchart.track;
						
						if (Array.isArray(wTracks) && wTracks.length > 0) {
							wTracks.forEach(t => totalWeeklyPlays += parseInt(t.playcount || 0));
							topTrackDisplay = `"${wTracks[0].name}" (${wTracks[0].playcount}x)`;
						} else if (wTracks && wTracks.playcount) {
							// Handles edge case when exactly one unique track is tracked
							totalWeeklyPlays = parseInt(wTracks.playcount);
							topTrackDisplay = `"${wTracks.name}" (${wTracks.playcount}x)`;
						}
					}
					document.getElementById('weekly-plays').textContent = `${totalWeeklyPlays.toLocaleString()} plays`;
					document.getElementById('weekly-top-track').textContent = topTrackDisplay;

					// 3. FETCH WEEKLY ARTIST DATA CHART
                    const weeklyArtistsUrl = `https://ws.audioscrobbler.com/2.0/?method=user.getweeklyartistchart&user=${LASTFM_USER}&api_key=${API_KEY}&format=json`;
					const artistResponse = await fetch(weeklyArtistsUrl);
					const artistData = await artistResponse.json();

					let topArtistDisplay = 'None this week';

					if (artistData.weeklyartistchart && artistData.weeklyartistchart.artist) {
						const wArtists = artistData.weeklyartistchart.artist;
						if (Array.isArray(wArtists) && wArtists.length > 0) {
							topArtistDisplay = `${wArtists[0].name} (${wArtists[0].playcount} plays)`;
						} else if (wArtists && wArtists.name) {
							topArtistDisplay = `${wArtists.name} (${wArtists.playcount} plays)`;
						}
					}
					document.getElementById('weekly-top-artist').textContent = topArtistDisplay;

				} catch (error) {
					console.error('Error fetching data from Last.fm API:', error);
					document.getElementById('song-name').textContent = 'Failed to load tracking data.';
				}
			}

			// Run profile poll immediately and script interval update every 30 seconds
			fetchLastFMData();
			setInterval(fetchLastFMData, 30000);
		
