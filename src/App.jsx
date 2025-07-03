// src/App.jsx
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import Home from "./components/Home.jsx";
import IdentifyPage from "./components/IdentificationPage.jsx";
import NavBar from "./components/NavBar.jsx";
import PrivateRoute from './components/PrivateRoute';
import LandingPage from "./LandingPage/LandingPage.jsx";

import ActivitiesContainer from "./components/ActivitiesContainer.jsx";
import FlyerManager from "./components/FlyerManager.jsx";
import HomepageImagesContainer from "./components/HomepageImagesContainer.jsx";

import CreateSurveyContainer from "./components/CreateSurveyContainer";
import CreateSurvey from "./components/CreateSurveyContainer.jsx";
import SurveyAnalysisDetail from "./components/SurveyAnalysisDetail";
import SurveyDetailContainer from "./components/SurveyDetailContainer.jsx";
import SurveyListContainer from "./components/SurveyListContainer.jsx";
import SurveyResultsDetail from "./components/SurveyResultsDetail.jsx";
import SurveyResultsList from "./components/SurveyResultsList.jsx";
import Surveys from "./components/Surveys.jsx";

import CreateMessage from "./components/CreateMessageContainer.jsx";
import ManageMessages from "./components/ManageMessages.jsx";
import MessageListContainer from "./components/MessageListContainer.jsx";
import MessageRepliesContainer from "./components/MessageRepliesContainer.jsx";

import AnalyticsDashboard from "./Analytic/AnalyticsDashboard";
import SurveyDetailsPage from './Analytic/SurveyDetailsPage';
import TagsDetailsPage from "./Analytic/TagsDetailsPage";
import ManageUsersContainer from "./components/ManageUsersContainer.jsx";
import PublicMessageBoardContainer from "./components/PublicMessageBoardContainer.jsx";

import ContactDetailsAdmin from "./components/ContactDetailsAdmin.jsx";

export default function App({ toggleTheme, mode }) {
  const { pathname } = useLocation();
  const hiddenRoutes = ["/", "/identificationPage"];
  const showNav = !hiddenRoutes.includes(pathname);

  useEffect(() => {
    addDoc(collection(db, "visits"), {
      timestamp: serverTimestamp(),          //  server timestamp
      uid: auth?.currentUser?.uid ?? null,   //  user ID (if logged in)
      path: window.location.pathname         //  current page
    }).catch((err) => console.error("VISIT WRITE ERROR:", err));
  }, []);

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
        <Route path="/Data-analysis" element={
          <PrivateRoute requireAdmin={true}><AnalyticsDashboard /></PrivateRoute>
        } />
        <Route path="/tags-details" element={
          <PrivateRoute requireAdmin={true}><TagsDetailsPage /></PrivateRoute>
        } />
        <Route path="/survey-details" element={
          <PrivateRoute requireAdmin={true}><SurveyDetailsPage /></PrivateRoute>
        } />

        <Route path="/HomepageImages" element={
          <PrivateRoute requireAdmin={true}><HomepageImagesContainer /></PrivateRoute>
        } />
        <Route path="/contact-details" element={
          <PrivateRoute requireAdmin={true}><ContactDetailsAdmin /></PrivateRoute>
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
        <Route path="/surveys/edit/:id" element={<CreateSurveyContainer />} />


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