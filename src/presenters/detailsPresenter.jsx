import { observer } from "mobx-react-lite"
import { View } from "react-native";
import { SuspenseView } from "../views/suspenseView";
import { DetailsView } from "../views/detailsView";

export const Details = observer(function SummaryRender(props) {
    const { model } = props;
    const { currentDishPromiseState, dishes, numberOfGuests } = model;
    const { promise = null, data = null, error = null } = currentDishPromiseState;

    const isPending = !data;

    function isCurrentDishInMenuCB(dish, currentDishId) {
        return dish.id === currentDishId;
    }
    
    function checkDishInMenuCB(dishes, currentDishId) {
        return dishes.find(dish => isCurrentDishInMenuCB(dish, currentDishId)) !== undefined;
    }
    
    const isDishInMenu = checkDishInMenuCB(dishes, model.currentDishId);

    function onDishAddedACB() {
        model.addToMenu(data);
    }

    return (
        <View>
            {isPending ? (
                <SuspenseView
                    promise={promise}
                    error={error} 
                />
            ) : (
                <DetailsView
                    dishData={data} 
                    guests={numberOfGuests}
                    isDishInMenu={isDishInMenu}
                    userWantsToAddDish={onDishAddedACB}
                />
            )}
        </View>
    )
})

