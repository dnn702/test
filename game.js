let maxCircles = 16; // 最大の障害物数
let currentCircles = 0; // 現在の障害物数
// 数字をフォーマットする関数（1,000 → 1k, 1,000,000 → 1M など）
function formatNumber(num) {
    if (num < 1000) {
        return num.toFixed(0); // 1,000未満の数字には小数点なし
    } else if (num >= 1e24) {
        return (num / 1e12).toFixed(1) + 'U'; // 兆 (小数点1桁)
    } else if (num >= 1e21) {
        return (num / 1e9).toFixed(1) + 'u'; // 億 (小数点1桁)
    } else if (num >= 1e18) {
        return (num / 1e6).toFixed(1) + 'Q'; // 百万 (小数点1桁)
    } else if (num >= 1e15) {
        return (num / 1e3).toFixed(1) + 'q'; // 千 (小数点1桁)
    } else if (num >= 1e12) {
        return (num / 1e12).toFixed(1) + 't'; // 兆 (小数点1桁)
    } else if (num >= 1e9) {
        return (num / 1e9).toFixed(1) + 'b'; // 億 (小数点1桁)
    } else if (num >= 1e6) {
        return (num / 1e6).toFixed(1) + 'm'; // 百万 (小数点1桁)
    } else if (num >= 1e3) {
        return (num / 1e3).toFixed(1) + 'k'; // 千 (小数点1桁)
    }
    return num.toString(); // それ以外はそのまま（小数点なし）
}

// 初期設定
let attackPower = 1;   // 初期攻撃力
let points = 0;        // 初期ポイント
let upgradeCost = 10;  // 初期攻撃力アップに必要なポイント
let stage = 1;         // 初期ステージ
let numCircles = 10;    // 初期の障害物の数
let circlesDefeated = 0; // 倒した円の数
let circleData = [];   // 各円のデータ（HPなど）

// DOM要素の取得
const circlesContainer = document.getElementById('circlesContainer');
const pointsElement = document.getElementById('points');
const attackPowerElement = document.getElementById('attackPower');
const upgradeBtn = document.getElementById('upgradeBtn');
const stageElement = document.getElementById('stage');

// ランダムな位置を生成する関数
function getRandomPosition() {
    const x = Math.random() * (window.innerWidth - 100);  // 画面幅内でランダムにX座標
    const y = Math.random() * (window.innerHeight - 100); // 画面高さ内でランダムにY座標
    return { x, y };
}

// HPに応じて円の色を変える関数
function getColorBasedOnHP(hp, maxHP) {
    const percentage = hp / maxHP;
    if (percentage > 0.80) {
        return 'red'; // HPが多い時は赤
    } else if (percentage > 0.60) {
        return 'orange'; // HPが中くらいの時は橙色
    } else if (percentage > 0.40) {
        return 'yellow'; // HPが少ない時は黄色
    } else if (percentage > 0.20) {
        return 'greenyellow'; // HPが少ない時は黄色
    } else {
        return 'lightblue'; // HPが非常に少ない時は水色
    }
}

// 障害物を生成する関数
function generateCircles() {
    // 以前の円を削除
    while (circlesContainer.firstChild) {
        circlesContainer.removeChild(circlesContainer.firstChild);
    }

    // 障害物のHPをステージごとに2倍に設定
    let circleHP = 10 * Math.pow(2, stage - 1);  // ステージ1では10、ステージ2では20、ステージ3では40...

    // 円データをリセット
    circleData = [];

    for (let i = 0; i < numCircles; i++) {
        // 円のデータを保存
        circleData.push({ hp: circleHP, element: null });

        const circle = document.createElement('div');
        circle.classList.add('circle');
        
        // ランダムな位置を取得して設定
        const position = getRandomPosition();
        circle.style.left = `${position.x}px`;
        circle.style.top = `${position.y}px`;

        // 初期状態で円の色を設定（HPに応じて）
        circle.style.backgroundColor = getColorBasedOnHP(circleHP, circleHP);

        // HP数を円の中心に表示
        const hpText = document.createElement('span');
        hpText.textContent = formatNumber(circleHP); // フォーマットを適用
        circle.appendChild(hpText);

        // HPバーを作成
        const hpBar = document.createElement('div');
        hpBar.classList.add('hp-bar');
        const hp = document.createElement('div');
        hp.classList.add('hp');
        hp.style.width = `${(circleHP / circleHP) * 100}%`;
        hpBar.appendChild(hp);

        // 円をクリックした時の処理
        circle.addEventListener('click', () => {
            // クリックでHPを減らす
            circleData[i].hp -= attackPower;
            
            // HPが0以下になった場合、その円を倒す
            if (circleData[i].hp <= 0) {
                // 円をDOMから削除
                circlesContainer.removeChild(circle);
                circleData[i].element = null; // データも削除
                circlesDefeated++;  // 倒した円の数を増加
            }

            // HPバーを更新
            hp.style.width = `${(circleData[i].hp / circleHP) * 100}%`;
            hpText.textContent = formatNumber(Math.max(circleData[i].hp, 0));  // HP数を更新（0未満にはならない）
            circle.style.backgroundColor = getColorBasedOnHP(circleData[i].hp, circleHP); // 色を更新

            points += attackPower;  // 攻撃力分だけポイントが加算される
            pointsElement.textContent = formatNumber(points);  // ポイントをフォーマットして更新

            // すべての障害物を倒した場合、次のステージに進む
            if (circlesDefeated >= numCircles) {
                nextStage();  // ステージを進める
            }
        });

        // 円にHPバーを追加
        circle.appendChild(hpBar);
        circlesContainer.appendChild(circle);

        // 円のデータを保存
        circleData[i].element = circle;
    }
}

// 次のステージに進む関数
function nextStage() {
    // すべての円が消えた後、circlesContainerを空にして次のステージへ進む
    if (circlesDefeated >= numCircles) {
        // circlesContainerを空にする
        circlesContainer.innerHTML = '';
        // ステージを進める
        stage++;
        circlesDefeated = 0;  // 倒した円の数をリセット

        // ステージの内容を更新
        numCircles += 0;  // 各ステージで障害物の数を増加
        stageElement.textContent = `ステージ: ${stage}`;  // ステージ表示を更新
        generateCircles();  // 新しいステージの円を生成
    }
}

// 攻撃力アップ処理
upgradeBtn.addEventListener('click', () => {
    if (points >= upgradeCost) {
        points -= upgradeCost;  // ポイントを消費
        attackPower *= 1.41;  // 攻撃力をアップ
        // 攻撃力アップ後にコストも増加
        upgradeCost = Math.round(upgradeCost * 1.5);  // コストを1.5倍に増加
        pointsElement.textContent = formatNumber(points);  // ポイントをフォーマットして更新
        attackPowerElement.textContent = formatNumber(attackPower);  // 攻撃力をフォーマットして更新
        upgradeBtn.textContent = `アップグレード (${formatNumber(upgradeCost)} ポイント)`;  // ボタンのテキスト更新
    } else {
        alert('ポイントが足りません！');
    }
});

// 初期化処理：ページが読み込まれたときに最初の円を生成
window.onload = () => {
    generateCircles();
};
