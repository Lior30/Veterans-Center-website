import React from 'react';
import ActivitiesContainer from './components/ActivitiesContainer';
import FlyersContainer     from './components/FlyersContainer';
import SurveysContainer    from './components/SurveysContainer';
import MessagesContainer   from './components/MessagesContainer';
import './App.css';

export default function App() {
  return (
    <div className="layout">
      <h1>מרכז הוותיקים – בית הכרם</h1>
      <ActivitiesContainer />
      <FlyersContainer />
      <SurveysContainer />
      <MessagesContainer />
    </div>
  );
}
