import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './ResultPage.css'; // Import the CSS file

const ResultPage = () => {
  const { candidateName } = useParams();
  const [totalMarks, setTotalMarks] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTotalMarks = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/marks/${candidateName}`);
        if (response.data.error) {
          setError(response.data.error);
        } else {
          setTotalMarks(response.data.totalMarks);
        }
      } catch (error) {
        console.error('Error fetching total marks:', error);
        setError('Error fetching total marks');
      }
    };

    fetchTotalMarks();
  }, [candidateName]);

  const resultstatus = () => {
    if (totalMarks >= 90) {
      return 'Excellent!';
    } else if (totalMarks >= 75) {
      return 'Great job!';
    } else if (totalMarks >= 50) {
      return 'Good effort!';
    } else {
      return 'Better luck next time!';
    }
  };

  return (
    <div className="result-page">
      <h1>Result for {candidateName}</h1>
      {error ? (
        <p className="error-message">{error}</p>
      ) : (
        <div className="result-container">
          <p className="total-marks">Total Marks: {totalMarks !== null ? totalMarks : 'Loading...'}</p>
          {totalMarks !== null && <p className="sticker">{resultstatus()}</p>}
        </div>
      )}
    </div>
  );
};

export default ResultPage;
