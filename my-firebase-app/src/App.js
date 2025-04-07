// src/App.js
import React, { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';  // <--- import our db from firebase.js

function App() {
  // ----------- ACTIVITIES -----------
  const [activities, setActivities] = useState([]);
  const [activityName, setActivityName] = useState('');
  const [activityRecurring, setActivityRecurring] = useState(false);
  const [activityTime, setActivityTime] = useState('');

  // For participants sub-collection
  const [participantName, setParticipantName] = useState('');
  const [participantPhone, setParticipantPhone] = useState('');
  const [selectedActivityId, setSelectedActivityId] = useState('');

  // ----------- FLYERS -----------
  const [flyers, setFlyers] = useState([]);
  const [flyerTitle, setFlyerTitle] = useState('');
  const [flyerUrl, setFlyerUrl] = useState('');
  const [flyerDesc, setFlyerDesc] = useState('');

  // ----------- SURVEYS -----------
  const [surveys, setSurveys] = useState([]);
  const [surveyTitle, setSurveyTitle] = useState('');
  const [surveyDesc, setSurveyDesc] = useState('');
  const [surveyIsActive, setSurveyIsActive] = useState(true);

  // For adding "responses" sub-collection
  const [selectedSurveyId, setSelectedSurveyId] = useState('');
  const [responseAnswers, setResponseAnswers] = useState('');

  // ----------- MESSAGES -----------
  const [messages, setMessages] = useState([]);
  const [messageTitle, setMessageTitle] = useState('');
  const [messageContent, setMessageContent] = useState('');

  // ============== LOAD DATA ON STARTUP ==============
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    await Promise.all([
      loadActivities(),
      loadFlyers(),
      loadSurveys(),
      loadMessages()
    ]);
  };

  // ============== LOAD ACTIVITIES ==============
  const loadActivities = async () => {
    const activitiesRef = collection(db, 'activities');
    const snapshot = await getDocs(activitiesRef);
    let actList = [];
    snapshot.forEach((docSnapshot) => {
      actList.push({ id: docSnapshot.id, ...docSnapshot.data() });
    });
    setActivities(actList);
  };

  // ============== ADD ACTIVITY ==============
  const addActivity = async () => {
    try {
      const activitiesRef = collection(db, 'activities');
      await addDoc(activitiesRef, {
        name: activityName,
        isRecurring: activityRecurring,
        time: activityTime
      });
      alert('Activity added!');
      setActivityName('');
      setActivityRecurring(false);
      setActivityTime('');
      loadActivities();
    } catch (err) {
      console.error(err);
      alert('Error adding activity');
    }
  };

  // ============== ADD PARTICIPANT (SUB-COLLECTION) ==============
  const addParticipant = async (activityId) => {
    try {
      const participantsRef = collection(db, `activities/${activityId}/participants`);
      await addDoc(participantsRef, {
        participantName,
        phone: participantPhone
      });
      alert('Participant added!');
      setParticipantName('');
      setParticipantPhone('');
      setSelectedActivityId('');
    } catch (err) {
      console.error(err);
      alert('Error adding participant');
    }
  };

  // ============== LOAD FLYERS ==============
  const loadFlyers = async () => {
    const flyersRef = collection(db, 'flyers');
    const snapshot = await getDocs(flyersRef);
    let flyerList = [];
    snapshot.forEach((docSnapshot) => {
      flyerList.push({ id: docSnapshot.id, ...docSnapshot.data() });
    });
    setFlyers(flyerList);
  };

  // ============== ADD FLYER ==============
  const addFlyer = async () => {
    try {
      const flyersRef = collection(db, 'flyers');
      await addDoc(flyersRef, {
        title: flyerTitle,
        url: flyerUrl,
        description: flyerDesc,
        createdAt: new Date()
      });
      alert('Flyer added!');
      setFlyerTitle('');
      setFlyerUrl('');
      setFlyerDesc('');
      loadFlyers();
    } catch (err) {
      console.error(err);
      alert('Error adding flyer');
    }
  };

  // ============== LOAD SURVEYS ==============
  const loadSurveys = async () => {
    const surveysRef = collection(db, 'surveys');
    const snapshot = await getDocs(surveysRef);
    let surveyList = [];
    snapshot.forEach((docSnapshot) => {
      surveyList.push({ id: docSnapshot.id, ...docSnapshot.data() });
    });
    setSurveys(surveyList);
  };

  // ============== ADD SURVEY ==============
  const addSurvey = async () => {
    try {
      const surveysRef = collection(db, 'surveys');
      await addDoc(surveysRef, {
        title: surveyTitle,
        description: surveyDesc,
        isActive: surveyIsActive
      });
      alert('Survey added!');
      setSurveyTitle('');
      setSurveyDesc('');
      setSurveyIsActive(true);
      loadSurveys();
    } catch (err) {
      console.error(err);
      alert('Error adding survey');
    }
  };

  // ============== ADD SURVEY RESPONSE (SUB-COLLECTION) ==============
  const addSurveyResponse = async (surveyId) => {
    try {
      const responsesRef = collection(db, `surveys/${surveyId}/responses`);
      await addDoc(responsesRef, {
        answers: responseAnswers,
        createdAt: new Date()
      });
      alert('Response submitted!');
      setResponseAnswers('');
      setSelectedSurveyId('');
    } catch (err) {
      console.error(err);
      alert('Error adding response');
    }
  };

  // ============== LOAD MESSAGES ==============
  const loadMessages = async () => {
    const messagesRef = collection(db, 'messages');
    const snapshot = await getDocs(messagesRef);
    let msgList = [];
    snapshot.forEach((docSnapshot) => {
      msgList.push({ id: docSnapshot.id, ...docSnapshot.data() });
    });
    setMessages(msgList);
  };

  // ============== ADD MESSAGE ==============
  const addMessage = async () => {
    try {
      const messagesRef = collection(db, 'messages');
      await addDoc(messagesRef, {
        title: messageTitle,
        content: messageContent,
        createdAt: new Date()
      });
      alert('Message added!');
      setMessageTitle('');
      setMessageContent('');
      loadMessages();
    } catch (err) {
      console.error(err);
      alert('Error adding message');
    }
  };

  // ============== DELETE EXAMPLE (OPTIONAL) ==============
  const deleteFlyer = async (flyerId) => {
    try {
      await deleteDoc(doc(db, 'flyers', flyerId));
      alert('Flyer deleted');
      loadFlyers();
    } catch (err) {
      console.error(err);
      alert('Error deleting flyer');
    }
  };

  // ============== RENDER ==============
  return (
    <div style={{ margin: '20px' }}>
      <h1>My Firebase App</h1>

      {/* ========== ACTIVITIES SECTION ========== */}
      <section style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
        <h2>Activities</h2>
        <ul>
          {activities.map((act) => (
            <li key={act.id}>
              <strong>{act.name}</strong> | Recurring: {act.isRecurring ? 'Yes' : 'No'} | Time: {act.time}
              <div>
                <button onClick={() => setSelectedActivityId(act.id)}>Add Participant</button>
              </div>
            </li>
          ))}
        </ul>

        <h3>Add a New Activity</h3>
        <input
          type="text"
          placeholder="Activity Name"
          value={activityName}
          onChange={(e) => setActivityName(e.target.value)}
        />
        <br />
        <label>
          Recurring?
          <input
            type="checkbox"
            checked={activityRecurring}
            onChange={(e) => setActivityRecurring(e.target.checked)}
          />
        </label>
        <br />
        <input
          type="text"
          placeholder="Time (e.g. 10:00-11:00)"
          value={activityTime}
          onChange={(e) => setActivityTime(e.target.value)}
        />
        <br />
        <button onClick={addActivity}>Add Activity</button>

        {selectedActivityId && (
          <div style={{ marginTop: '10px', backgroundColor: '#eee', padding: '5px' }}>
            <h4>Add Participant to Activity</h4>
            <input
              type="text"
              placeholder="Participant Name"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
            />
            <br />
            <input
              type="text"
              placeholder="Participant Phone"
              value={participantPhone}
              onChange={(e) => setParticipantPhone(e.target.value)}
            />
            <br />
            <button onClick={() => addParticipant(selectedActivityId)}>Save Participant</button>
          </div>
        )}
      </section>

      {/* ========== FLYERS SECTION ========== */}
      <section style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
        <h2>Flyers</h2>
        <ul>
          {flyers.map((fly) => (
            <li key={fly.id}>
              <strong>{fly.title}</strong> <br />
              <a href={fly.url} target="_blank" rel="noreferrer">
                Open Flyer
              </a>
              <br />
              {fly.description} <br />
              <button onClick={() => deleteFlyer(fly.id)}>Delete Flyer</button>
            </li>
          ))}
        </ul>

        <h3>Add a New Flyer</h3>
        <input
          type="text"
          placeholder="Flyer Title"
          value={flyerTitle}
          onChange={(e) => setFlyerTitle(e.target.value)}
        />
        <br />
        <input
          type="text"
          placeholder="Flyer URL"
          value={flyerUrl}
          onChange={(e) => setFlyerUrl(e.target.value)}
        />
        <br />
        <input
          type="text"
          placeholder="Flyer Description"
          value={flyerDesc}
          onChange={(e) => setFlyerDesc(e.target.value)}
        />
        <br />
        <button onClick={addFlyer}>Add Flyer</button>
      </section>

      {/* ========== SURVEYS SECTION ========== */}
      <section style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
        <h2>Surveys</h2>
        <ul>
          {surveys.map((survey) => (
            <li key={survey.id}>
              <strong>{survey.title}</strong> (Active: {survey.isActive ? 'Yes' : 'No'})
              <br />
              {survey.description} <br />
              <button onClick={() => setSelectedSurveyId(survey.id)}>Submit Response</button>
            </li>
          ))}
        </ul>

        <h3>Add a New Survey</h3>
        <input
          type="text"
          placeholder="Survey Title"
          value={surveyTitle}
          onChange={(e) => setSurveyTitle(e.target.value)}
        />
        <br />
        <input
          type="text"
          placeholder="Survey Description"
          value={surveyDesc}
          onChange={(e) => setSurveyDesc(e.target.value)}
        />
        <br />
        <label>
          Is Active?
          <input
            type="checkbox"
            checked={surveyIsActive}
            onChange={(e) => setSurveyIsActive(e.target.checked)}
          />
        </label>
        <br />
        <button onClick={addSurvey}>Add Survey</button>

        {selectedSurveyId && (
          <div style={{ marginTop: '10px', backgroundColor: '#eee', padding: '5px' }}>
            <h4>Submit Survey Response</h4>
            <textarea
              placeholder="Your answers here..."
              value={responseAnswers}
              onChange={(e) => setResponseAnswers(e.target.value)}
            />
            <br />
            <button onClick={() => addSurveyResponse(selectedSurveyId)}>Submit Response</button>
          </div>
        )}
      </section>

      {/* ========== MESSAGES SECTION ========== */}
      <section style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '20px' }}>
        <h2>Messages</h2>
        <ul>
          {messages.map((msg) => (
            <li key={msg.id}>
              <strong>{msg.title}</strong>
              <br />
              {msg.content}
            </li>
          ))}
        </ul>

        <h3>Add a New Message</h3>
        <input
          type="text"
          placeholder="Message Title"
          value={messageTitle}
          onChange={(e) => setMessageTitle(e.target.value)}
        />
        <br />
        <textarea
          placeholder="Message Content"
          value={messageContent}
          onChange={(e) => setMessageContent(e.target.value)}
        />
        <br />
        <button onClick={addMessage}>Add Message</button>
      </section>
    </div>
  );
}

export default App;