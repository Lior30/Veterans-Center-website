// src/App.jsx
import React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { Routes, Route, useLocation } from "react-router-dom";
import theme from "./theme";             // וודאי שהנתיב נכון

import NavBar from "./components/NavBar.jsx";
import LandingPage from "./components/LandingPage.jsx";
import IdentifyPage from "./components/IdentificationPage.jsx";
import Home from "./components/Home.jsx";

import ActivitiesContainer from "./components/ActivitiesContainer.jsx";
import FlyerManager from "./components/FlyerManager.jsx";
import HomepageImagesContainer from "./components/HomepageImagesContainer.jsx";

import Surveys from "./components/Surveys.jsx";
import CreateSurvey from "./components/CreateSurveyContainer.jsx";
import SurveyResultsList from "./components/SurveyResultsList.jsx";
import SurveyResultsDetail from "./components/SurveyResultsDetail.jsx";
import SurveyAnalysisDetail from "./components/SurveyAnalysisDetail";
import SurveyListContainer from "./components/SurveyListContainer.jsx";
import SurveyDetailContainer from "./components/SurveyDetailContainer.jsx";

import ManageMessages from "./components/ManageMessages.jsx";
import CreateMessage from "./components/CreateMessageContainer.jsx";
import MessageListContainer from "./components/MessageListContainer.jsx";
import MessageRepliesContainer from "./components/MessageRepliesContainer.jsx";

import PublicMessageBoardContainer from "./components/PublicMessageBoardContainer.jsx";
import ManageUsersContainer from "./components/ManageUsersContainer.jsx";

export default function App() {
  const { pathname } = useLocation();
  const hiddenRoutes = ["/", "/landingPage", "/identificationPage"];
  const showNav = !hiddenRoutes.includes(pathname);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />  {/* מאפס סגנונות ומכניס את ה‐background.default */}
      {showNav && <NavBar />}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/identificationPage" element={<IdentifyPage />} />

        <Route path="/home" element={<Home />} />
        <Route path="/activities" element={<ActivitiesContainer />} />
        <Route path="/flyers" element={<FlyerManager />} />
        <Route path="/manage-users" element={<ManageUsersContainer />} />

        {/* Surveys – admin */}
        <Route path="/surveys" element={<Surveys />} />
        <Route path="/surveys/create" element={<CreateSurvey />} />
        <Route path="/surveys/results" element={<SurveyResultsList />} />
        <Route path="/surveys/results/:id" element={<SurveyResultsDetail />} />
        <Route path="/surveys/analysis/:id" element={<SurveyAnalysisDetail />} />

        {/* Surveys – public */}
        <Route path="/surveys/list" element={<SurveyListContainer />} />
        <Route path="/surveys/take/:id" element={<SurveyDetailContainer />} />

        <Route path="/HomepageImages" element={<HomepageImagesContainer />} />

        {/* Messages – admin */}
        <Route path="/messages" element={<ManageMessages />} />
        <Route path="/messages/create" element={<CreateMessage />} />
        <Route path="/messages/list" element={<MessageListContainer />} />
        <Route path="/messages/replies/:id" element={<MessageRepliesContainer />} />

        {/* Messages – public */}
        <Route path="/messages/board" element={<PublicMessageBoardContainer />} />
      </Routes>
    </ThemeProvider>
  );
}
