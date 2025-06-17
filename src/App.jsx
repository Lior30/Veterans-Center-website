// src/App.jsx
import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

import PrivateRoute from './components/PrivateRoute';
import NavBar from "./components/NavBar.jsx";
import LandingPage from "./LandingPage/LandingPage.jsx";
import IdentifyPage from "./components/IdentificationPage.jsx";
import Home from "./components/Home.jsx";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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

export default function App({ toggleTheme, mode }) {
  const { pathname } = useLocation();
  const hiddenRoutes = ["/", "/identificationPage"];
  const showNav = !hiddenRoutes.includes(pathname);

  return (
    <>
      {showNav && <NavBar toggleTheme={toggleTheme} mode={mode} />}

      <Routes>
        {/* ✅ Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/identificationPage" element={<IdentifyPage />} />
        <Route path="/surveys/list" element={<SurveyListContainer />} />
        <Route path="/surveys/take/:id" element={<SurveyDetailContainer />} />
        <Route path="/messages/board" element={<PublicMessageBoardContainer />} />

        {/* 🔐 Protected routes (admin only) */}
        <Route path="/home" element={
          <PrivateRoute requireAdmin={true}><Home /></PrivateRoute>
        } />
        <Route path="/activities" element={
          <PrivateRoute requireAdmin={true}><ActivitiesContainer /></PrivateRoute>
        } />
        <Route path="/flyers" element={
          <PrivateRoute requireAdmin={true}><FlyerManager /></PrivateRoute>
        } />
        <Route path="/manage-users" element={
          <PrivateRoute requireAdmin={true}><ManageUsersContainer /></PrivateRoute>
        } />
        <Route path="/HomepageImages" element={
          <PrivateRoute requireAdmin={true}><HomepageImagesContainer /></PrivateRoute>
        } />


        {/* 🔐 Surveys – admin */}
        <Route path="/surveys" element={
          <PrivateRoute requireAdmin={true}><Surveys /></PrivateRoute>
        } />
        <Route path="/surveys/create" element={
          <PrivateRoute requireAdmin={true}><CreateSurvey /></PrivateRoute>
        } />
        <Route path="/surveys/results" element={
          <PrivateRoute requireAdmin={true}><SurveyResultsList /></PrivateRoute>
        } />
        <Route path="/surveys/results/:id" element={
          <PrivateRoute requireAdmin={true}><SurveyResultsDetail /></PrivateRoute>
        } />
        <Route path="/surveys/analysis/:id" element={
          <PrivateRoute requireAdmin={true}><SurveyAnalysisDetail /></PrivateRoute>
        } />


        {/* 🔐 Messages – admin */}
        <Route path="/messages" element={
          <PrivateRoute requireAdmin={true}><ManageMessages /></PrivateRoute>
        } />
        <Route path="/messages/create" element={
          <PrivateRoute requireAdmin={true}><CreateMessage /></PrivateRoute>
        } />
        <Route path="/messages/list" element={
          <PrivateRoute requireAdmin={true}><MessageListContainer /></PrivateRoute>
        } />
        <Route path="/messages/replies/:id" element={
          <PrivateRoute requireAdmin={true}><MessageRepliesContainer /></PrivateRoute>
        } />
      </Routes>
    </>
  );
}
