import axios from "axios";
import React, { Component } from "react";
import EditEquipment from "./EditEquipment";
import GoogleMapReact from "google-map-react";

import Geocode from "react-geocode";



const AnyReactComponent = ({ text }) => <div backgroundColor= "white">{text}</div>;

export default class EquipmentDetails extends Component {
  state = {
    equipment: null,
    imageurl: undefined,
    name: "",
    description: "",
    price: 0,
    deposit: 0,
    email: "",
    street: "",
    number: Number,
    city: "",
    postalCode: Number,
    country: "",
    error: null,
    editForm: false,
    center: {
      lat: 52.5186,
      lng: 13.4081,
    },
    zoom: 11,
    // this is the flag
    // dataRequested: false
  };

  addressConversion = () => {
    const address =
      this.state.street +
      this.state.number +
      this.state.city +
      this.state.postalCode +
      this.state.country;
    Geocode.fromAddress(address).then(
      (response) => {
        const { lat, lng } = response.results[0].geometry.location;
        console.log(">>>>>Conversion:");
        console.log(lat, lng);
        this.setState({
          center: {
            lat: lat,
            lng: lng,
          },
        });
      },
      (error) => {
        console.log(">>>>>BANANA:");

        console.error(error);
      }
    );
  };

  

  toggleEditForm = () => {
    this.setState((state) => ({
      editForm: !state.editForm,
    }));
  };

  getData = () => {
    // // sets a flag - the data is requested but is not there yet
    // this.setState({
    //   dataRequested: true
    // })
    axios
      .get(`/api/equipments/${this.props.match.params.id}`)
      .then((response) => {
        console.log("$$$$$$$ aqui!");
        console.log(response.data.lat);
        this.setState({
          equipment: response.data,
          imageurl: response.data.imageurl,
          name: response.data.name,
          description: response.data.description,
          price: response.data.price,
          deposit: response.data.deposit,

          // this unsets the flag when the data is available
          // dataRequested: false
        });
      })
      .catch((err) => {
        console.log(err);
        if (err.response.status === 404) {
          this.setState({
            error: "Not found 🤷‍♀️🤷‍♂️",
          });
        }
      });
  };

  deleteEquipment = () => {
    axios
      .delete(`/api/equipments/${this.state.equipment._id}`)
      .then(() => {
        // we want to redirect to the equipments list
        this.props.history.push("/equipments");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState({
      [name]: value,
    });
  };

  handleSubmit = (e) => {
    const { imageurl, name, description, price, deposit } = this.state;
    e.preventDefault();
    axios
      .put(`/api/equipments/${this.state.equipment._id}`, {
        imageurl,
        name,
        description,
        price,
        deposit,
      })
      .then((response) => {
        this.setState({
          equipment: response.data,
          imageurl: response.data.imageurl,
          name: response.data.name,
          description: response.data.description,
          price: response.data.price,
          deposit: response.data.deposit,
          center: {
            lat: response.data.lat,
            lng: response.data.lng,
          },
          editForm: false,
        });
      })
      .catch((err) => console.log(err));
  };

  componentDidMount() {
    this.getData();
  }

  render() {
    {
      this.addressConversion();
    }  
    console.log("Coordenadas:");
    console.log(this.state.center);
    if (this.state.error) return <h2>{this.state.error}</h2>;
    if (!this.state.equipment) return <></>;
    return (
      <>
        <h1>Name: {this.state.equipment.name}</h1>
        <img src={this.state.imageurl} width="200px"></img>
        <p>Description: {this.state.equipment.description}</p>
        <p>Price: {this.state.equipment.price}</p>
        <p>Deposit: {this.state.equipment.deposit}</p>
        <button onClick={this.deleteEquipment}>Delete this Equipment ❌</button>
        <button onClick={this.toggleEditForm}>Show Edit Form 📝</button>
        {this.state.editForm && (
          <EditEquipment
            {...this.state}
            handleChange={this.handleChange}
            handleSubmit={this.handleSubmit}
          />
        )}
        <div style={{ height: "50vh", width: "50%" }}>
          <GoogleMapReact
            bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAPS }}
            defaultCenter={this.state.center}
            defaultZoom={this.state.zoom}
          >
            <AnyReactComponent lat={52.5186} lng={13.4081} text="My Marker" />
          </GoogleMapReact>
        </div>
      </>
    );
  }
}
