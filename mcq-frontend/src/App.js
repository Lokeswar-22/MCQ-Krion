import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Route, Routes, useNavigate } from 'react-router-dom';
import './App.css';
import ResultPage from './ResultPage';

function App() {
  const [candidateName, setCandidateName] = useState('');
  const [candidateRegisterNumber, setCandidateRegisterNumber] = useState('');
  const [isValidCandidate, setIsValidCandidate] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState(1);
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');
  const [resultMessage, setResultMessage] = useState('');
  const [candidateInfo, setCandidateInfo] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [newCandidateName, setNewCandidateName] = useState('');
  const [newCandidateRegisterNumber, setNewCandidateRegisterNumber] = useState('');
  const [updateCandidateId, setUpdateCandidateId] = useState('');
  const [updateCandidateName, setUpdateCandidateName] = useState('');
  const [updateCandidateRegisterNumber, setUpdateCandidateRegisterNumber] = useState('');
  const [deleteCandidateId, setDeleteCandidateId] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); 
  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidateInfo();
  }, []);

  useEffect(() => {
    if (isValidCandidate && !isAdmin) {
      fetchQuestion();
      const timer = setInterval(() => {
        setTimeRemaining(prevTime => {
          if (prevTime <= 1) {
            clearInterval(timer);
            navigate(`/result/${candidateName}`);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isValidCandidate, currentQuestionId, isAdmin, navigate, candidateName]);

  const fetchCandidateInfo = async () => {
    try {
      const response = await axios.get('http://localhost:3000/candidateinfo');
      setCandidateInfo(response.data);
      const candidate = response.data.find(candidate => candidate.candidateName === candidateName && candidate.candidateRegisterNumber === candidateRegisterNumber);
      if (candidateName === 'admin' && candidateRegisterNumber === 'adminhr123') {
        setIsAdmin(true);
        setIsValidCandidate(true);
      } else {
        setIsValidCandidate(!!candidate);
      }
    } catch (error) {
      console.error('Error fetching candidate info:', error);
    }
  };

  const fetchQuestion = async () => {
    try {
      const response = await axios.get(`http://localhost:3000/questions/${currentQuestionId}`);
      setQuestion(response.data.question);
      setOptions(response.data.options);
    } catch (error) {
      console.error('Error fetching question:', error);
    }
  };

  const submitAnswer = async () => {
    try {
      const response = await axios.post(`http://localhost:3000/answer/${currentQuestionId}`, {
        answer: selectedOption,
        candidateName: candidateName
      });
      setResultMessage(response.data);
      setSelectedOption('');

      if (currentQuestionId < 20) {
        setCurrentQuestionId(prevId => prevId + 1);
      } else {
        navigate(`/result/${candidateName}`);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
    }
  };

  const handleLogin = () => {
    fetchCandidateInfo();
  };

  const handleOptionChange = event => {
    setSelectedOption(event.target.value);
  };

  const handleAddCandidate = async () => {
    try {
      await axios.post('http://localhost:3000/candidateinfo', {
        candidateName: newCandidateName,
        candidateRegisterNumber: newCandidateRegisterNumber,
        adminName: candidateName,
        adminRegNumber: candidateRegisterNumber
      });
      fetchCandidateInfo();
    } catch (error) {
      console.error('Error adding candidate:', error);
    }
  };

  const handleUpdateCandidate = async () => {
    try {
      await axios.put(`http://localhost:3000/candidateinfo/${updateCandidateId}`, {
        candidateName: updateCandidateName,
        candidateRegisterNumber: updateCandidateRegisterNumber,
        adminName: candidateName,
        adminRegNumber: candidateRegisterNumber
      });
      fetchCandidateInfo();
    } catch (error) {
      console.error('Error updating candidate:', error);
    }
  };

  const handleDeleteCandidate = async () => {
    try {
      await axios.delete(`http://localhost:3000/candidateinfo/${deleteCandidateId}`, {
        data: {
          adminName: candidateName,
          adminRegNumber: candidateRegisterNumber
        }
      });
      fetchCandidateInfo();
    } catch (error) {
      console.error('Error deleting candidate:', error);
    }
  };

  useEffect(() => {
    if (isValidCandidate && !isAdmin) {
      fetchQuestion();
    }
  }, [isValidCandidate, currentQuestionId, isAdmin]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Krion MCQ</h1>
      </header>
      <Routes>
        <Route exact path="/" element={
          !isValidCandidate ? (
            <div className="login-container">
              <h2>Login</h2>
              <input type="text" placeholder="Name" value={candidateName} onChange={e => setCandidateName(e.target.value)} />
              <input type="text" placeholder="Register Number" value={candidateRegisterNumber} onChange={e => setCandidateRegisterNumber(e.target.value)} />
              <button onClick={handleLogin}>Login</button>
            </div>
          ) : (
            <div className="content-container">
              {isAdmin ? (
                <div className="admin-panel">
                  <h2>Admin Panel</h2>
                  <div className="candidate-info">
                    <h3>Candidate Info</h3>
                    <table>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Candidate Name</th>
                          <th>Register Number</th>
                          <th>Scored mark</th>
                        </tr>
                      </thead>
                      <tbody>
                        {candidateInfo.map(candidate => (
                          <tr key={candidate.id}>
                            <td>{candidate.id}</td>
                            <td>{candidate.candidateName}</td>
                            <td>{candidate.candidateRegisterNumber}</td>
                            <td>{candidate.totalMarks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="crud-operations">
                    <h3>Add Candidate</h3>
                    <input type="text" placeholder="Candidate Name" value={newCandidateName} onChange={e => setNewCandidateName(e.target.value)} />
                    <input type="text" placeholder="Register Number" value={newCandidateRegisterNumber} onChange={e => setNewCandidateRegisterNumber(e.target.value)} />
                    <button onClick={handleAddCandidate}>Add Candidate</button>
                    <h3>Update Candidate</h3>
                    <input type="text" placeholder="Candidate ID" value={updateCandidateId} onChange={e => setUpdateCandidateId(e.target.value)} />
                    <input type="text" placeholder="New Candidate Name" value={updateCandidateName} onChange={e => setUpdateCandidateName(e.target.value)} />
                    <input type="text" placeholder="New Register Number" value={updateCandidateRegisterNumber} onChange={e => setUpdateCandidateRegisterNumber(e.target.value)} />
                    <button onClick={handleUpdateCandidate}>Update Candidate</button>
                    <h3>Delete Candidate</h3>
                    <input type="text" placeholder="Candidate ID" value={deleteCandidateId} onChange={e => setDeleteCandidateId(e.target.value)} />
                    <button onClick={handleDeleteCandidate}>Delete Candidate</button>
                  </div>
                </div>
              ) : (
                <div className="question-container">
                  <div className="question-card">
                    <h2>Question {currentQuestionId}</h2>
                    <h3>{question}</h3>
                    <ul className="options-list">
                      {options.map(option => (
                        <li key={option}>
                          <input
                            type="radio"
                            id={option}
                            name="option"
                            value={option}
                            checked={selectedOption === option}
                            onChange={handleOptionChange}
                          />
                          <label htmlFor={option}>{option}</label>
                        </li>
                      ))}
                    </ul>
                    <button onClick={submitAnswer}>Submit Answer</button>
                    {resultMessage && <p>{resultMessage}</p>}
                  </div>
                  <div className="timer">
                    <h3>Time Remaining: {Math.floor(timeRemaining / 60)}:{('0' + timeRemaining % 60).slice(-2)}</h3>
                  </div>
                </div>
              )}
            </div>
          )
        } />
        <Route path="/result/:candidateName" element={<ResultPage />} />
      </Routes>
    </div>
  );
}

export default App;
