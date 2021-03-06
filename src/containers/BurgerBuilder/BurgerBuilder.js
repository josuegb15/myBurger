import React, { Component } from 'react';

import axios from '../../axios-orders';

import Aux from '../../hoc/Aux/Aux';
import Modal from '../../components/UI/Modal/Modal';
import Spinner from '../../components/UI/Spinner/Spinner'
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler'

import Burger from '../../components/Burger/Burger';
import BurgerControls from '../../components/Burger/BuildControls/BuildControls';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';

const INGREDIENT_PRICES = {
  salad: 0.5,
  cheese: 0.4,
  meat: 1.3,
  bacon: 0.7
};

class BurgerBuilder extends Component {

  state = {
    ingredients: null,
    totalPrice: 4,
    purchasable: false,
    purchasing: false,
    loading: false,
    error: false
  }

  componentDidMount() {
    axios.get('/ingredients.json')
      .then(response => {
        this.setState({ ingredients: response.data });
      })
      .catch( error => { this.setState({ error: true }) } );
  }

  updatePurchaseState(ingredients) {
    const sum = Object.keys(ingredients)
      .map(igKey => ingredients[igKey])
      .reduce((sum, el) => (sum + el), 0);

    this.setState({purchasable: sum > 0});
  }

  addIngredientHandler = (type) => {
    const oldCount = this.state.ingredients[type];
    const updatedCount = oldCount + 1;
    const updatedIngredientes = {
      ...this.state.ingredients
    };
    updatedIngredientes[type] = updatedCount;
    const oldPrice = this.state.totalPrice;
    const priceAddition = INGREDIENT_PRICES[type];
    const newPrice = oldPrice + priceAddition;
    this.setState({ ingredients: updatedIngredientes, totalPrice: newPrice });
    this.updatePurchaseState(updatedIngredientes);
  }

  removeIngredientHandler = (type) => {
    const oldCount = this.state.ingredients[type];
    if (oldCount <=0) return;
    const updatedCount = oldCount - 1;
    const updatedIngredientes = {
      ...this.state.ingredients
    };
    updatedIngredientes[type] = updatedCount;
    const oldPrice = this.state.totalPrice;
    const priceDecretion = INGREDIENT_PRICES[type];
    const newPrice = oldPrice - priceDecretion;
    this.setState({ ingredients: updatedIngredientes, totalPrice: newPrice });
    this.updatePurchaseState(updatedIngredientes);
  }

  purchaseHandler = () => {
    this.setState({ purchasing: true } );
  }

  purchaseCancelHandler = () => {
    this.setState({ purchasing: false });
  }

  purchaseContinueHandler = () => {
    this.setState({ loading: true });

    const order = {
      ingredients: this.state.ingredients,
      price: this.state.totalPrice,
      costumer: {
        name: 'Max',
        address: {
          street: 'Test Street 1',
          zipCode: '12345',
          country: 'Germany'
        },
        email: 'test@test.com'
      },
      deliveryMethod: 'fastest'
    };

    axios.post('/orders.json', order)
      .then( response => {
        this.setState({ loading: false, purchasing: false });
      })
      .catch( error => {
        this.setState({ loading: false, purchasing: false });
      });
  }

  render () {

    const disabledInfo = {
      ...this.state.ingredients
    };

    for (let key in disabledInfo) {
      disabledInfo[key] = disabledInfo[key] <= 0;
    }

    const orderSummary = (!this.state.ingredients || this.state.loading) ? <Spinner /> : (
      <OrderSummary
        ingredients={this.state.ingredients}
        purchaseContinue={this.purchaseContinueHandler}
        purchaseCancel={this.purchaseCancelHandler}
        price={this.state.totalPrice} />
    );

    let burger = !this.state.ingredients ? < Spinner /> : (
      <Aux>
        <Burger ingredients={this.state.ingredients} />
        <BurgerControls
          addIngredient={this.addIngredientHandler}
          removeIngredient={this.removeIngredientHandler}
          disabled={disabledInfo}
          price={this.state.totalPrice}
          purchasable={this.state.purchasable}
          order={this.purchaseHandler} />
      </Aux>
    );

    if (this.state.error) burger = <p style={{ textAlign: 'center' }}> Ingredients can't be loaded! </p>;

    return (
      <Aux>
        <Modal
          show={this.state.purchasing}
          closeModal={this.purchaseCancelHandler}>
          { orderSummary }
        </Modal>
        { burger }
      </Aux>
    );
  }
}

export default withErrorHandler(BurgerBuilder, axios);
