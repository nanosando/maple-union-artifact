import './Artifact.css';
import React from 'react';
import { useEffect, useState } from 'react';
import { Layout, Button, Spin, Card, Col, Row, InputNumber, Select, Popconfirm } from 'antd';

const { Content } = Layout;

const cardStyle = { "aspect-ratio": "1 / 1", "width": "16em", "background-color": "rgb(242, 242, 242)" };
const cardNoStyle = { "aspect-ratio": "1 / 1", "width": "16em", "display": "flex", "align-items": "center", "justify-content": "center", "background-color": "rgb(242, 242, 242)" };

const abilities = [
    {"label": "올스탯 증가", "unit": "", "max": 150, "per_level": 15},
    {"label": "최대 HP/MP 증가", "unit": "", "max": 7500, "per_level": 750},
    {"label": "공격력/마력 증가", "unit": "", "max": 30, "per_level": 3},
    {"label": "데미지 증가", "unit": "%", "max": 15, "per_level": 1.5},
    {"label": "보스 몬스터 공격 시 데미지 증가", "unit": "%", "max": 15, "per_level": 1.5},
    {"label": "몬스터 방어율 무시 증가", "unit": "%", "max": 20, "per_level": 2},
    {"label": "버프 지속시간 증가", "unit": "%", "max": 20, "per_level": 2},
    {"label": "재사용 대기시간 미적용 확률 증가", "unit": "%", "max": 7.50, "per_level": 0.75},
    {"label": "메소 획득량 증가", "unit": "%", "max": 12, "per_level": 1},
    {"label": "아이템 드롭률 증가", "unit": "%", "max": 12, "per_level": 1},
    {"label": "크리티컬 확률 증가", "unit": "%", "max": 20, "per_level": 2},
    {"label": "크리티컬 데미지 증가", "unit": "%", "max": 4.00, "per_level": 0.4},
    {"label": "추가 경험치 획득 증가", "unit": "%", "max": 12, "per_level": 1},
    {"label": "상태이상 내성 증가", "unit": "", "max": 12, "per_level": 1},
    {"label": "소환수 지속시간 증가", "unit": "%", "max": 20, "per_level": 2},
    {"label": "파이널 어택류 스킬 데미지 증가", "unit": "%", "max": 30, "per_level": 3},
];

function Artifact(){
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({});
    const [apError, setApError] = useState(false);

    const getApFromLevel = (level) => {
        const ap = level + Math.floor(level / 5);
        return ap;
    }

    const makeSelectOptions = (disableOptions) => {
        const optionsArr = [];
        const numOptions = abilities.length;

        for (var i = 0; i < numOptions; i++) {
            const singleOption = {
                value: i,
                label: abilities[i].label
            }
            if (disableOptions.includes(i)){
                singleOption.disabled = true;
            }
            optionsArr.push(singleOption);
        }
        return optionsArr;
    }

    const onChangeOption = (cardNum, value, optionIdx) => {
        const newData = JSON.parse(JSON.stringify(data));

        const updatedCard = JSON.parse(JSON.stringify(data.cards[cardNum]));

        updatedCard.selectedOptions[optionIdx] = value;
        updatedCard.options0 = makeSelectOptions([updatedCard.selectedOptions[1], updatedCard.selectedOptions[2]]);
        updatedCard.options1 = makeSelectOptions([updatedCard.selectedOptions[0], updatedCard.selectedOptions[2]]);
        updatedCard.options2 = makeSelectOptions([updatedCard.selectedOptions[0], updatedCard.selectedOptions[1]]);

        newData.cards[cardNum] = updatedCard;
        setData(newData);
        localStorage.setItem('union_data', JSON.stringify(newData));
    }

    const onChangeLevel = (value) => {
        const newData = JSON.parse(JSON.stringify(data));

        const maxCards = 3 + Math.floor(value / 10);

        for(var i = 0; i < 9; i++){
            if (i < maxCards)
                newData.cards[i].enabled = true;
            else
                newData.cards[i].enabled = false;
        }

        newData.level = value;
        newData.apAll = getApFromLevel(value);
        newData.apRemained = getApFromLevel(value) - newData.apUsed;

        if (newData.apAll !== (newData.apRemained + newData.apUsed) || newData.apRemained < 0){
            setApError(true);
        }
        else {
            setApError(false);
        }

        setData(newData);
        localStorage.setItem('union_data', JSON.stringify(newData));
    }

    const onClickCardLevelControl = (cardNum, adder) => {
        const newData = JSON.parse(JSON.stringify(data));

        const originalLevel = newData.cards[cardNum].level;
        var newLevel = originalLevel + adder;

        if (newLevel <= 0 || newLevel > 5){
            return;
        }

        if (adder > 0) {
            if (newLevel === 2) {
                newData.apRemained = newData.apRemained - 1;
                newData.apUsed = newData.apUsed + 1;
            }
            if (newLevel === 3 || newLevel === 4) {
                newData.apRemained = newData.apRemained - 2;
                newData.apUsed = newData.apUsed + 2;
            }
            if (newLevel === 5) {
                newData.apRemained = newData.apRemained - 3;
                newData.apUsed = newData.apUsed + 3;
            }
        }
        else {
            if (newLevel === 1) {
                newData.apRemained = newData.apRemained + 1;
                newData.apUsed = newData.apUsed - 1;
            }
            if (newLevel === 2 || newLevel === 3) {
                newData.apRemained = newData.apRemained + 2;
                newData.apUsed = newData.apUsed - 2;
            }
            if (newLevel === 4) {
                newData.apRemained = newData.apRemained + 3;
                newData.apUsed = newData.apUsed - 3;
            }
        }

        newData.cards[cardNum].level = newLevel;

        if (newData.apAll !== (newData.apRemained + newData.apUsed) || newData.apRemained < 0){
            setApError(true);
        }
        else {
            setApError(false);
        }

        setData(newData);
        localStorage.setItem('union_data', JSON.stringify(newData));
    }

    const onReset = (e) => {
        setLoading(true);

        const startLevel = 1;
        const startAP = getApFromLevel(startLevel);

        const initialData = {
            level: startLevel,
            apAll: startAP,
            apRemained: startAP,
            apUsed: 0,
            cards: []
        };

        for(var i = 0; i < 9; i++) {
            const initialCard = {
                cardNum: i,
                enabled: false,
                level: 1,
                selectedOptions: [0, 1, 2],
                options0: makeSelectOptions([1, 2]),
                options1: makeSelectOptions([0, 2]),
                options2: makeSelectOptions([0, 1]),
            };
            if (i < 3){
                initialCard.enabled = true;
            }
            initialData.cards.push(initialCard);
        }

        setData(initialData);
        localStorage.setItem('union_data', JSON.stringify(initialData));
        setLoading(false);
    }

    useEffect(() => {
        setLoading(true);
        var prevData = localStorage.getItem('union_data');

        if (prevData) {
            const loadedData = JSON.parse(prevData);
            setData(loadedData);
            setLoading(false);
            return;
        }
        
        const startLevel = 1;
        const startAP = getApFromLevel(startLevel);

        const initialData = {
            level: startLevel,
            apAll: startAP,
            apRemained: startAP,
            apUsed: 0,
            cards: []
        };

        for(var i = 0; i < 9; i++) {
            const initialCard = {
                cardNum: i,
                enabled: false,
                level: 1,
                selectedOptions: [0, 1, 2],
                options0: makeSelectOptions([1, 2]),
                options1: makeSelectOptions([0, 2]),
                options2: makeSelectOptions([0, 1]),
            };
            if (i < 3){
                initialCard.enabled = true;
            }
            initialData.cards.push(initialCard);
        }

        setData(initialData);
        localStorage.setItem('union_data', JSON.stringify(initialData));
        setLoading(false);
    }, []);

    const makeCard = (cardNum) => {
        return (
        <Card hoverable bordered={false} style={cardStyle}>
            <div className="cardContent">
                <div className="cardLevelController">
                    <Button shape="circle" onClick={() => onClickCardLevelControl(cardNum, -1)}>
                    {'<'}
                    </Button>
                    <div className="cardLevelText">
                        Lv. {data.cards[cardNum].level}
                    </div>
                    <Button shape="circle" onClick={() => onClickCardLevelControl(cardNum, 1)}>
                    {'>'}
                    </Button>
                </div>
                <div className="cardOptions">
                    <Select className="optionSelect" defaultValue={0} value={data.cards[cardNum].selectedOptions[0]} options={data.cards[cardNum].options0} onChange={(value)=>onChangeOption(cardNum, value, 0)}></Select>
                    <Select className="optionSelect" defaultValue={1} value={data.cards[cardNum].selectedOptions[1]} options={data.cards[cardNum].options1} onChange={(value)=>onChangeOption(cardNum, value, 1)}></Select>
                    <Select className="optionSelect" defaultValue={2} value={data.cards[cardNum].selectedOptions[2]} options={data.cards[cardNum].options2} onChange={(value)=>onChangeOption(cardNum, value, 2)}></Select>
                </div>
            </div>
        </Card>);
    }

    const makeFinalAbility = () => {
        const numOptions = abilities.length;
        const optionsLevelArr = Array(numOptions).fill(0);
        const optionsArr = Array(numOptions).fill(0);

        for (var i = 0; i < 9; i++){
            for (var j = 0; j < 3; j++){
                if (data.cards[i].enabled) {
                    optionsLevelArr[data.cards[i].selectedOptions[j]] += data.cards[i].level;
                    if (optionsLevelArr[data.cards[i].selectedOptions[j]] > 10)
                    optionsLevelArr[data.cards[i].selectedOptions[j]] = 10;
                }
            }
        }

        for (var k = 0; k < numOptions; k++) {
            if (optionsLevelArr > 10)
                optionsLevelArr[k] = 10;

            optionsArr[k] = optionsLevelArr[k] * abilities[k].per_level;

            if (abilities[k].max === 12)
                optionsArr[k] += Math.floor(optionsLevelArr[k] / 5);
        }

        return (
            <table className={apError? "infoTextSmallError" : "infoTextSmall"}>
                {optionsArr.reduce(function (acc, item, index) {
                    if (item === 0)
                        return acc;
                    else {
                        acc.push(<tr>
                            <td> {abilities[index].label} </td>
                            <td> Lv. {optionsLevelArr[index]} </td>
                            <td> {item} {abilities[index].unit} </td>
                        </tr>);
                        return acc;
                    }
                }, [])}
            </table>
        );
    }

    return(
        loading?
        <Content className="contents">
            <Spin size="large" className="spin"/>
        </Content> : 
        <Content className="contents">
            <div className="container">
            {
                data && data.cards ? 
                <div className="cards">
                    <Row gutter={[16, 16]} className="rowMargin">
                        <Col span={8}>
                        {
                            data.cards[0].enabled? 
                            makeCard(0) :
                            <Card hoverable bordered={false} style={cardNoStyle}>
                                <div className="cardDisMsg"> 기본 개방 </div>
                            </Card>
                        }
                        </Col>
                        <Col span={8}>
                        {
                            data.cards[1].enabled? 
                            makeCard(1) :
                            <Card hoverable bordered={false} style={cardNoStyle}>
                                <div className="cardDisMsg"> 기본 개방 </div>
                            </Card>
                        }
                        </Col>
                        <Col span={8}>
                        {
                            data.cards[2].enabled? 
                            makeCard(2) :
                            <Card hoverable bordered={false} style={cardNoStyle}>
                                <div className="cardDisMsg"> 기본 개방 </div>
                            </Card>
                        }
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]} className="rowMargin">
                        <Col span={8}>
                            {
                                data.cards[3].enabled? 
                                makeCard(3) :
                                <Card hoverable bordered={false} style={cardNoStyle}>
                                    <div className="cardDisMsg"> 10레벨 개방 </div>
                                </Card>
                            }
                        </Col>
                        <Col span={8}>
                        {
                            data.cards[4].enabled? 
                            makeCard(4) :
                            <Card hoverable bordered={false} style={cardNoStyle}>
                                <div className="cardDisMsg"> 20레벨 개방 </div>
                            </Card>
                        }
                        </Col>
                        <Col span={8}>
                        {
                            data.cards[5].enabled? 
                            makeCard(5) :
                            <Card hoverable bordered={false} style={cardNoStyle}>
                                <div className="cardDisMsg"> 30레벨 개방 </div>
                            </Card>
                        }
                        </Col>
                    </Row>
                    <Row gutter={[16, 16]} className="rowMargin">
                        <Col span={8}>
                        {
                            data.cards[6].enabled? 
                            makeCard(6) :
                            <Card hoverable bordered={false} style={cardNoStyle}>
                                <div className="cardDisMsg"> 40레벨 개방 </div>
                            </Card>
                        }
                        </Col>
                        <Col span={8}>
                        {
                            data.cards[7].enabled? 
                            makeCard(7) :
                            <Card hoverable bordered={false} style={cardNoStyle}>
                                <div className="cardDisMsg"> 50레벨 개방 </div>
                            </Card>
                        }
                        </Col>
                        <Col span={8}>
                        {
                            data.cards[8].enabled? 
                            makeCard(8) :
                            <Card hoverable bordered={false} style={cardNoStyle}>
                                <div className="cardDisMsg"> 60레벨 개방 </div>
                            </Card>
                        }
                        </Col>
                    </Row>
                </div> :
                <></>
            }
                <div className="infos">
                    <Card hoverable bordered={false} className="infoCard">
                        <div className="levelForm">
                            <div className="infoText"> 아티팩트 레벨 </div>
                            <InputNumber size="large" min={1} max={60} defaultValue={1} value={data.level} onChange={onChangeLevel} />
                        </div>
                        <div className="apInfo">
                            <table className={apError? "infoTextSmallError" : "infoTextSmall"}>
                                <tr>
                                    <td > 총 AP </td>
                                    <td> {data.apAll} </td>
                                </tr>
                                <tr>
                                    <td> 남은 AP </td>
                                    <td> {data.apRemained} </td>
                                </tr>
                                <tr>
                                    <td> 사용한 AP </td>
                                    <td> {data.apUsed} </td>
                                </tr>
                            </table>
                        </div>
                    </Card>
                    <Card hoverable bordered={false} className="infoCard">
                        <div className="levelForm">
                            <div className="infoText"> 현재 적용 능력치 </div>
                        </div>
                        <div className="abilityInfo">
                            { data.cards? makeFinalAbility() : <></>}
                        </div>
                    </Card>
                    <Popconfirm
                        title="전부 초기화"
                        description="정말로 초기화 하시겠습니까?"
                        onConfirm={onReset}
                        okText="예"
                        cancelText="아니오">
                        <Button danger type="primary" className="resetButton"> 전부 초기화 </Button>
                    </Popconfirm>
                </div>
            </div>
        </Content>
    );
}

export default Artifact;