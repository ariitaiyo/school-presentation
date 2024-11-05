function search(data) {
    const resultElement = document.getElementById('result');
    if (!resultElement) return;

    const recommendations = data.list.map(song => `
        <div class="card">
            <article class="card-content">
                <div class="card-header">
                    <h1 class="card-title zenkaku-bold">${song.contents}</h1>
                </div>
                <div class="card-body">
                    <h3 class="artist zenkaku-medium">Artist:${song.artist}</h3>
                    <h3 class="reqest-number zenkaku-medium">リクエストナンバー:${song.requestNo}</h3>
                </div>    
            </article>
        </div>
    `).join('\n');

    resultElement.innerHTML = `<div class="song-list">${recommendations}</div>`;
}
async function searchSong() {
    const songName = document.getElementById('requestNoInput').value;
    try {
        const results = await getSongRequestNumber(songName);
        const resultElement = document.getElementById('res');  // 'res' から 'result' に変更
        
        if (!resultElement) {
            console.error('結果を表示する要素が見つかりません');
            return;
        }
        
        if (results.length > 0) {
            const resultHTML = results.map(song => `
                <div class="song-item">
                    <p>曲名: ${song.songName}</p>
                    <p>アーティスト: ${song.artistName}</p>
                    <p>リクエストNo: ${song.requestNo}</p>
                </div>
            `).join('');
            resultElement.innerHTML = resultHTML;
        } else {
            resultElement.innerHTML = '検索結果が見つかりませんでした。';
        }
    } catch (error) {
        const resultElement = document.getElementById('result');
        if (resultElement) {
            resultElement.innerHTML = 'エラーが発生しました。';
        }
        console.error('エラーの詳細:', error);
    }
}
async function getRecommendedSongs() {
    try {
        const requestNoInput = document.getElementById('requestNoInput');
        const requestNo = requestNoInput.value.trim() || '5277-09';  // デフォルト値を設定

        const formData = new URLSearchParams();
        formData.append('compId', '1');
        formData.append('contractId', '1');
        formData.append('compAuthKey', '2/Qb9R@8s*');
        formData.append('format', 'json');
        formData.append('requestNoList', requestNo);  // 入力値を使用
        formData.append('serial', 'AB316238');     // 機器のシリアル番号

        const response = await fetch('https://csgw.clubdam.com/minsei/recommend/GetRecommendSongs.api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData.toString()
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('おすすめの曲:', data);

        displayRecommendations(data);

    } catch (error) {
        console.error('エラーが発生しました:', error);
        handleError(error);
    }
}

function displayRecommendations(data) {
    const resultElement = document.getElementById('result');
    if (!resultElement) return;

    const artistCount = {};
    const MAX_ARTIST_APPEARANCES = 3;

    const limitedArtistSongs = data.list.filter(song => {
        artistCount[song.artist] = (artistCount[song.artist] || 0) + 1;
        return artistCount[song.artist] <= MAX_ARTIST_APPEARANCES;
    });

    const recommendations = limitedArtistSongs.map(song => `
        
        <div class="card card-radius_02">
            <article class="card-content">
            <p class="artist-sp">${song.artist}</p>
                <div class="card-header">
                
                    <h1 class="card-title zenkaku-bold">${song.contents}</h1>
                </div>
                    <h3 class="artist zenkaku-medium">Artist:  ${song.artist}</h3>
                    <h3 class="reqest-number zenkaku-medium">選曲番号:${song.requestNo}</h3>  
            </article>
        </div>
    `).join('\n');

    resultElement.innerHTML = `<h1 class="title">この曲に関連している曲</h1><div class="song-list">${recommendations}</div>`;
}

function handleError(error) {
    const resultElement = document.getElementById('result');
    if (resultElement) {
        resultElement.textContent = `エラー: ${error.message}`;
    }
}