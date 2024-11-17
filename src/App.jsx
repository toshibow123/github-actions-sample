import React, { useEffect, useState } from 'react';
import { supabase } from './supabase';

function App() {
  const [inputContent, setInputContent] = useState(""); // 入力用
  const [inputTime, setInputTime] = useState(""); // 入力用
  const [displayWord, setDisplayWord] = useState("入力されていない項目があります"); // 警告文
  const [totalTime, setTotalTime] = useState(0); // 合計時間
  const [records, setRecords] = useState([]); // 記録一覧
  const [isLoading, setIsLoading] = useState(true); // ローディング状態

  // データの取得
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from("study-record").select("*");

      if (error) {
        console.error("データ取得エラー:", error);
      } else {
        setRecords(data);
      }
      setIsLoading(false);
    };

    fetchData();
  }, []);

  // データの追加処理
  const addTodo = async () => {
    if (inputContent.trim() === "" || isNaN(parseInt(inputTime))) {
      setDisplayWord("学習内容と時間を正しく入力してください！");
      return;
    }

    const { data, error } = await supabase.from("study-record").insert([{ title: inputContent, time: parseInt(inputTime) }]);

    if (error) {
      console.error("追加エラー:", error);
    } else {
      console.log("追加成功:", data);
      setRecords([...records, ...data]); // 新しいデータを追加
      setTotalTime(prevTotal => prevTotal + parseInt(inputTime));
      setInputContent("");
      setInputTime("");
      setDisplayWord(""); // 警告文を消す
    }
  };

  // 最も古いデータを削除
  const deleteOldestTodo = async () => {
    const { data, error } = await supabase.from("study-record").select("id").order("id", { ascending: true }).limit(1);

    if (error) {
      console.error("削除エラー:", error);
      return;
    }

    if (data && data.length > 0) {
      const oldestId = data[0].id;

      const { error: deleteError } = await supabase.from("study-record").delete().eq("id", oldestId);

      if (deleteError) {
        console.error("削除失敗:", deleteError);
      } else {
        console.log("削除成功");
        setRecords(records.filter(record => record.id !== oldestId));
      }
    } else {
      console.log("削除対象がありません");
    }
  };

  // 個別削除
  const deleteTodo = async (id) => {
    const { error } = await supabase.from("study-record").delete().eq("id", id);

    if (error) {
      console.error("削除エラー:", error.message);
    } else {
      console.log("削除成功");
      setRecords(records.filter(record => record.id !== id));
      alert("削除が成功しました！")
    }
  };

  // 入力変更処理
  const handleInputChange = (e) => setInputContent(e.target.value);
  const handleTimeChange = (e) => setInputTime(e.target.value);

  return (
    <div>
      <div>
        <h>学習内容</h>
        <input placeholder="学習内容を入力" value={inputContent} onChange={handleInputChange} />
      </div>

      <div>
        <h>学習時間</h>
        <input placeholder="0" value={inputTime} onChange={handleTimeChange} />
        <h>時間</h>
      </div>

      <div>
        <button onClick={addTodo}>登録</button>
        <button onClick={deleteOldestTodo}>最古削除</button>
      </div>

      <div>
        <h>{displayWord}</h>
      </div>

      <div>
        <h>合計時間: {totalTime}時間</h>
      </div>

      <div>
        <h>記録一覧:</h>
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          records.map((record) => (
            <div key={record.id}>
              <h3>{record.title}</h3>
              <p>時間: {record.time}時間</p>
              <button onClick={() => deleteTodo(record.id)}>削除</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;
