/* eslint-disable @typescript-eslint/no-misused-promises */
import { useState } from 'react';
import uuid from 'react-uuid';

import { Input } from 'components/shared';
import Button from 'components/shared/Button';
import { Dropdown } from 'components/shared/Dropdown';
import { db } from 'config/firebase';
import { collection, doc, getDocs, query, setDoc } from 'firebase/firestore';

interface InputType {
  text: string;
}

interface Props {
  topic: boolean;
  selectCategory: string;
  gameTitle: string;
}

interface GameListType {
  id: number;
  question: string;
  answer: string;
}

export const AddTextGame = ({ topic, selectCategory, gameTitle }: Props) => {
  const [countList, setCountList] = useState<number[]>([0]);
  const [question, setQuestion] = useState<InputType[]>([{ text: '' }]);
  const [answer, setAnswer] = useState<InputType[]>([{ text: '' }]);
  const [quiz, setQuiz] = useState<GameListType[]>([]);
  const [selectTopic, setSelectTopic] = useState<string>('');

  const questionChangeHandler = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const updatedQuestions = [...question];
    updatedQuestions[idx].text = e.target.value;
    setQuestion(updatedQuestions);
    updateQuiz(idx, e.target.value, 'question');
  };

  const answerChangeHandler = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const updatedAnswers = [...answer];
    updatedAnswers[idx].text = e.target.value;
    setAnswer(updatedAnswers);
    updateQuiz(idx, e.target.value, 'answer');
  };

  const updateQuiz = (idx: number, text: string, type: string): void => {
    const updatedQuiz = [...quiz];
    if (type === 'question') {
      updatedQuiz[idx] = { ...updatedQuiz[idx], question: text };
    } else if (type === 'answer') {
      updatedQuiz[idx] = { ...updatedQuiz[idx], answer: text };
    } else if (type === 'delete') {
      updatedQuiz.splice(idx, 1);
    }
    setQuiz(updatedQuiz);
  };

  const divDeleteHandler = (item: number, idx: number) => {
    const deleteDiv = countList.filter(el => el !== item);
    setCountList(deleteDiv);

    const deletedQuestions = question.filter((_, i) => i !== item);
    setQuestion(deletedQuestions);

    const deletedAnswers = answer.filter((_, i) => i !== item);
    setAnswer(deletedAnswers);

    updateQuiz(idx, '', 'delete');
  };

  const divAddHandler = (): void => {
    const countArr = [...countList];
    let counter = countArr.slice(-1)[0];
    counter += 1;
    countArr.push(counter);
    setCountList(countArr);
    setQuestion([...question, { text: '' }]);
    setAnswer([...answer, { text: '' }]);
  };

  const PostGameList = async (): Promise<void> => {
    if (gameTitle === '') {
      alert('제목을 입력해주세요.');
      return;
    }
    if (topic && selectTopic === '') {
      alert('게임 주제를 선택해주세요.');
      return;
    }
    if (quiz.length <= 4) {
      alert('5문제 이상 작성해주세요.');
      return;
    }

    const today = new Date();
    const id = uuid();

    const gameList = {
      date: today.toLocaleString('en-US'),
      userId: '',
      category: selectCategory,
      topic: selectTopic ?? null,
      title: gameTitle,
      totalQuiz: quiz.length
    };

    await setDoc(doc(db, 'GameLists', id), gameList);
    await setDoc(doc(db, 'Games', id), { quiz });
    alert('성공');
  };

  const getData = async () => {
    const docRef = query(collection(db, 'Games'));
    const docSnap = await getDocs(docRef);
    docSnap.forEach(doc => {
      console.log(doc.id, doc.data());
    });
  };

  return (
    <>
      <div>
        <div className="flex flex-col p-2 gap-y-2 border-t-[1px] border-black">
          {!topic ? (
            <></>
          ) : (
            <Dropdown
              options={['속담', '사자성어', '일상 단어']}
              onChange={val => {
                setSelectTopic(val);
              }}
            />
          )}
          <p>작성된 문항 수: 0</p>
        </div>
        <ul>
          {countList?.map((item, idx) => (
            <li
              key={idx}
              className="flex items-center justify-center gap-x-16 rounded-xl w-[1000px] h-[150px] bg-hoverSkyBlue shadow-md mb-10"
            >
              <Input
                inputType="textarea"
                inputStyleType="quiz"
                holderMsg="문제를 입력해주세요."
                onChange={e => {
                  questionChangeHandler(e, idx);
                }}
                value={question[idx]?.text}
              />
              {item !== 0 ? (
                <button
                  className="relative w-4 bottom-[38%] left-[48%]"
                  onClick={() => {
                    divDeleteHandler(item, idx);
                  }}
                >
                  X
                </button>
              ) : (
                <div className="w-4" />
              )}
              <Input
                inputType="textarea"
                inputStyleType="quiz"
                holderMsg="정답을 입력해주세요."
                onChange={e => {
                  answerChangeHandler(e, idx);
                }}
                value={answer[idx]?.text}
              />
            </li>
          ))}
        </ul>
        <Button buttonStyle="gray2 md full outlined" onClick={divAddHandler}>
          +
        </Button>
      </div>
      <Button buttonStyle="yellow md" onClick={PostGameList}>
        작성 완료
      </Button>
      <Button buttonStyle="yellow md" onClick={getData}>
        테스트
      </Button>
    </>
  );
};