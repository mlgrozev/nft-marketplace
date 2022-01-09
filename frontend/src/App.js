import "./App.css";
import Navbar from "./components/Navbar";
import { Routes, Route, Link, Outlet, useParams, useNavigate, HashRouter } from "react-router-dom";
import CreateItem from "./components/CreateItem"
import CreatorDashboard from "./components/CreatorDashboard"
import Home from "./components/Main"
import MyAssets from "./components/MyAssets"
import AddressAssets from "./components/AddressAssets"
import Collections from "./components/Collections";
import Auctions from "./components/Auctions";
import CollectionDetail from "./components/CollectionDetail";


const App = () => {

  return (
    <div className="App">
    <Navbar/>

    <Routes>
      <Route path="/" element={<Home />}/>
      <Route path="/create-item" element={<CreateItem />}/>
      <Route path="/creator-dashboard" element={<CreatorDashboard />}/>
      <Route path="/address-assets/:id" element={<AddressAssets />}/>
      <Route path="/address-assets" element={<AddressAssets />}/>
      <Route path="/my-assets" element={<MyAssets />}/>
      <Route path="/create-collection" element={<Collections />}/>
      <Route path="/collection-detail/:id" element={<CollectionDetail />}/>
      <Route path="/auctions" element={<Auctions />}/>
    </Routes>
 
    </div>
  );
};


export default App;
