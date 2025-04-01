import { FlatList, StyleSheet, Text, View } from "react-native"
import { sortIngredients, getCardStyle } from "../utilities"; 

/* Functional JSX component. Name must start with capital letter */
export function SummaryView(props) {
    /* Callback for rendering each ingredient row - implement in TW 1.3 */
    function renderIngredientRowCB(element) {
        const ingr = element.item // FlatList sends objects with a property called item

        if (!ingr) return null // Check for empty ingredient

        return (
            <View testID="summary-row" style={styles.card}>
                <View style={styles.left}>
                    <Text style={styles.ingredientName}>
                        {ingr.name}
                    </Text>
                    <Text style={styles.ingredientAisle}>{ingr.aisle}</Text>
                </View>
                <View style={styles.right}>
                    <Text style={styles.ingredientQuantity}>
                        {(ingr.amount * props.people).toFixed(2)} {ingr.unit}
                    </Text>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {/* TW 1.2 note the syntax: {JS_expression_or_comment} */}
            <Text style={styles.headerText}>
                Summary for <Text>{props.people}</Text>{" "}
                {props.people === 1 ? "person" : "persons"}:
            </Text>

            {/* <View testID="summary-row" style={styles.card}>
                <View style={styles.row}>
                    <Text>Name</Text>
                    <Text>Aisle</Text>
                    <Text>Quantity</Text>
                </View>
                <FlatList
                    data={props.ingredients}
                    renderItem={renderIngredientRowCB}
                />
            </View> */}

            <View style={styles.listContainer}>
                <FlatList
                    data={sortIngredients(props.ingredients)}
                    renderItem={renderIngredientRowCB}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        flex: 1,
        width: "90%",
        maxWidth: "90%",
        alignSelf: "center",
    },
    headerText: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
    },
    listContainer: {
        // backgroundColor: "#BEBEBE",
        borderRadius: 8,
        flex: 1,
        marginTop: 16,
        paddingBottom: 12,
    },
    // card: {
    //     padding: 12,
    //     flexDirection: "row",
    //     justifyContent: "space-between",
    // },
    card: {
        ...getCardStyle(), 
        padding: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        marginVertical: 6,
    },
    left: {
        flexDirection: "column",
        padding: 3,
    },
    right: {
        padding: 3,
        justifyContent: "center",
    },
    ingredientName: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 4,
    },
    ingredientAisle: {
        fontSize: 14,
        color: "#555",
    },
    ingredientQuantity: {
        fontSize: 16,
        fontWeight: "500",
    },
})
