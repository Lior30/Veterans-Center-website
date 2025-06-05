// src/App.jsx
import React                          from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import NavBar                         from "./components/NavBar.jsx";
import LandingPage                    from "./components/LandingPage.jsx";
import GuestLandingPage               from "./components/GuestLandingPage.jsx";
import IdentifyPage                   from "./components/IdentificationPage.jsx";
import Home                           from "./components/Home.jsx";

import ActivitiesContainer            from "./components/ActivitiesContainer.jsx";
import FlyerManager                   from "./components/FlyerManager.jsx";

import Surveys                        from "./components/Surveys.jsx";
import CreateSurvey                   from "./components/CreateSurveyContainer.jsx";
import SurveyResultsList              from "./components/SurveyResultsList.jsx";
import SurveyResultsDetail            from "./components/SurveyResultsDetail.jsx";
import SurveyListContainer            from "./components/SurveyListContainer.jsx";
import SurveyDetailContainer          from "./components/SurveyDetailContainer.jsx";

import ManageMessages                 from "./components/ManageMessages.jsx";
import CreateMessage                  from "./components/CreateMessageContainer.jsx";
import MessageListContainer           from "./components/MessageListContainer.jsx";
import MessageRepliesContainer        from "./components/MessageRepliesContainer.jsx";

import PublicMessageBoardContainer    from "./components/PublicMessageBoardContainer.jsx";
// import ReplyContainer               from "./components/ReplyContainer.jsx";  ← לא מיובא יותר במסלולים

import ManageUsersContainer           from "./components/ManageUsersContainer.jsx";

export default function App() {
  const { pathname } = useLocation();
  const hiddenRoutes = ["/", "/landingPage", "/identificationPage"];
  const showNav = !hiddenRoutes.includes(pathname);

  return (
    <>
      {showNav && <NavBar />}

      <Routes>
        {/* Public (guest) landing page */}
        <Route path="/"                   element={<GuestLandingPage />} />

        {/* registered landing page */}
        <Route path="/landingPage"        element={<LandingPage />} />

        {/* identification page */}
        <Route path="/identificationPage" element={<IdentifyPage />} />

        {/* Admin home & system */}
        <Route path="/home"               element={<Home />} />
        <Route path="/activities"         element={<ActivitiesContainer />} />
        <Route path="/flyers"             element={<FlyerManager />} />
        <Route path="/manage-users"       element={<ManageUsersContainer />} />

        {/* Surveys – admin */}
        <Route path="/surveys"            element={<Surveys />} />
        <Route path="/surveys/create"     element={<CreateSurvey />} />
        <Route path="/surveys/results"    element={<SurveyResultsList />} />
        <Route path="/surveys/results/:id" element={<SurveyResultsDetail />} />

        {/* Surveys – public */}
        <Route path="/surveys/list"       element={<SurveyListContainer />} />
        <Route path="/surveys/take/:id"   element={<SurveyDetailContainer />} />

        {/* Messages – admin */}
        <Route path="/messages"           element={<ManageMessages />} />
        <Route path="/messages/create"    element={<CreateMessage />} />
        <Route path="/messages/list"      element={<MessageListContainer />} />
        <Route path="/messages/replies/:id" element={<MessageRepliesContainer />} />

        {/* Messages – public */}
        <Route path="/messages/board"     element={<PublicMessageBoardContainer />} />
        {/*
        // הסרתי את השורה הבאה כדי למנוע ניווט לעמוד ניהול:
        // <Route path="/messages/reply/:id" element={<ReplyContainer />} />
        */}
      </Routes>
    </>
  );
}
