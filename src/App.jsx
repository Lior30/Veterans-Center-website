// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";

import NavBar                       from "./components/NavBar.jsx";
import Home                         from "./components/Home.jsx";
import ActivitiesContainer          from "./components/ActivitiesContainer.jsx";
import FlyerManager                 from "./components/FlyerManager.jsx";

import Surveys                      from "./components/Surveys.jsx";
import CreateSurvey                 from "./components/CreateSurveyContainer.jsx";
import SurveyResultsList            from "./components/SurveyResultsList.jsx";
import SurveyResultsDetail          from "./components/SurveyResultsDetail.jsx";
import SurveyListContainer          from "./components/SurveyListContainer.jsx";
import SurveyDetailContainer        from "./components/SurveyDetailContainer.jsx";

import ManageMessages               from "./components/ManageMessages.jsx";
import CreateMessage                from "./components/CreateMessageContainer.jsx";
import MessageListContainer         from "./components/MessageListContainer.jsx";
import MessageRepliesContainer      from "./components/MessageRepliesContainer.jsx";

import PublicMessageBoardContainer  from "./components/PublicMessageBoardContainer.jsx";
import ReplyContainer               from "./components/ReplyContainer.jsx";

export default function App() {
  return (
    <>
      <NavBar />

      <Routes>
        {/* Home & Core */}
        <Route path="/"                  element={<Home />} />
        <Route path="/activities"        element={<ActivitiesContainer />} />
        <Route path="/flyers"            element={<FlyerManager />} />

        {/* ── Surveys (Admin) ── */}
        <Route path="/surveys"           element={<Surveys />} />
        <Route path="/surveys/create"    element={<CreateSurvey />} />
        <Route path="/surveys/results"   element={<SurveyResultsList />} />
        <Route path="/surveys/results/:id" element={<SurveyResultsDetail />} />

        {/* ── Surveys (Public) ── */}
        <Route path="/surveys/list"      element={<SurveyListContainer />} />
        <Route path="/surveys/take/:id"  element={<SurveyDetailContainer />} />

        {/* ── Messages (Admin) ── */}
        <Route path="/messages"           element={<ManageMessages />} />
        <Route path="/messages/create"    element={<CreateMessage />} />
        <Route path="/messages/list"      element={<MessageListContainer />} />
        <Route path="/messages/replies/:id" element={<MessageRepliesContainer />} />

        {/* ── Messages (Public) ── */}
        <Route path="/messages/board"     element={<PublicMessageBoardContainer />} />
        <Route path="/messages/reply/:id" element={<ReplyContainer />} />
      </Routes>
    </>
  );
}
