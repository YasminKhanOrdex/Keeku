import React, { useState, useEffect } from 'react'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { RFValue } from 'react-native-responsive-fontsize';
import * as Colors from '../../../../res/colors';
import * as Constants from '../../../../res/strings';
import Arrow from '../../../../assets/images/icn_arrow.svg'
import moment from 'moment';
import Hyperlink from 'react-native-hyperlink';


export default function InformationComponent(props) {
    const actualCategory = JSON.parse(JSON.stringify(props?.data?.categories[0]));
    let [category, setCategory] = useState(JSON.parse(JSON.stringify(props?.data?.categories[0])));

    const isEditProfile = props.isEditProfile || false;
    const isMainProfile = props.isMainProfile || false;
    const navigation = props.navigation;
    const [selectedIndex, setSelectedIndex] = useState(null);
    const [selectedSubIndex, setSelectedSubIndex] = useState(null);


    useEffect(() => {
        if (!isEditProfile) {
            const tempCat = categoryFormatting(JSON.parse(JSON.stringify(actualCategory)));
            setCategory(tempCat);
        }
    }, []);

    const categoryFormatting = (categoryElement) => {

        // For every section of category
        categoryElement.sections.forEach((sectionElement) => {
            let checkForEmptySection = true;

            sectionElement = sectionFormatting(sectionElement);
            sectionElement.subSections.forEach((subSectionsElement) => {
                subSectionsElement = sectionFormatting(subSectionsElement);
                if (subSectionsElement.fields.length !== 0) {
                    checkForEmptySection = false;
                }
            });
            if (sectionElement.fields.length === 0 && checkForEmptySection) {
                sectionElement.removeFromView = true;
            }
        });

        categoryElement.sections = categoryElement.sections.filter((sectionElement) => !sectionElement.removeFromView);
        categoryElement.sections.sort((a, b) => a.displayOrder >= b.displayOrder);

        // // For every section of subCategory
        categoryElement.subCategories.forEach((subCatElements) => {
            subCatElements.sections.forEach((sectionElement) => {
                let checkForEmptySection = true;

                sectionElement = sectionFormatting(sectionElement);
                sectionElement.subSections.forEach((subSectionsElement) => {
                    subSectionsElement = sectionFormatting(subSectionsElement);
                    if (subSectionsElement.fields.length !== 0) {
                        checkForEmptySection = false;
                    }
                });
                if (sectionElement.fields.length === 0 && checkForEmptySection) {
                    sectionElement.removeFromView = true;
                }
            });

            subCatElements.sections = subCatElements.sections.filter((sectionElement) => !sectionElement.removeFromView);
            subCatElements.sections.sort((a, b) => a.displayOrder >= b.displayOrder);
        });

        return categoryElement;
    }

    const sectionFormatting = (sectionElement) => {
        let socialMediaPlatform = '';
        sectionElement.fields.forEach((field) => {
            // remove field if no value
            if (field.value == "" || field.value == null || field.value == undefined) {
                field.removeElement = true;
            }
            else {

                // add platform url to different social media
                if (field.title == 'Platform') {
                    if (field.value == 'Twitter') {
                        socialMediaPlatform = 'Twitter';
                    }
                    if (field.value == 'Instagram') {
                        socialMediaPlatform = 'Instagram';
                    }
                    if (field.value == 'Facebook') {
                        socialMediaPlatform = 'Facebook';
                    }
                }
                if (field.title == 'Handle') {
                    if (field.value != '' && socialMediaPlatform == 'Twitter') {
                        field.value = 'https://www.twitter.com/' + field.value + '';
                    }
                    if (field.value != '' && socialMediaPlatform == 'Instagram') {
                        field.value = 'https://www.instagram.com/' + field.value + '';
                    }
                    if (field.value != '' && socialMediaPlatform == 'Facebook') {
                        field.value = 'https://www.facebook.com/' + field.value + '';
                    }
                }

                // set date time formate
                if (field.datatype == 'Datetime') {
                    field.value = moment(field.value).format('ll');
                }

                if (field.multiselect === 'Yes') {
                    let value = field.value.reduce((obj, val) => {
                        return obj = obj === '' ? val : `${obj}, ${val}`;
                    }, '')
                    field.value = value;
                }
            }
        });

        sectionElement.fields = sectionElement.fields.filter((field) => !field.removeElement);

        sectionElement.fields.sort((a, b) => a.displayOrder >= b.displayOrder);

        return sectionElement;
    }


    const gotoEditProfilePage = (item, position) => {
        navigation.navigate(Constants.screen_edit_form_details, { item: item, profileData: props.data, position: position });
    }

    const gotoBasicDetail = () => {
        navigation.navigate(Constants.screen_edit_basic_details, { userData: props.data, isMainProfile: isMainProfile });
    }

    const renderSection = (item, index, position) => {
        return (
            <View kay={index.toString()} >
                {!isEditProfile && item.name !== null && <TouchableOpacity
                    style={styles.itemTitleContainer}
                    onPress={() => index == selectedIndex ? setSelectedIndex(null) : setSelectedIndex(index)}
                >
                    <Text style={styles.headingTextStyle}>{item.name} {item.dontShow}</Text>
                    <Arrow
                        width={RFValue(15)}
                        height={RFValue(15)}
                        style={selectedIndex == index ? {
                            transform: [{ rotate: "180deg" }]
                        } : null}
                    />
                </TouchableOpacity>}

                {isEditProfile && <TouchableOpacity
                    style={styles.itemTitleContainer}
                    onPress={() => gotoEditProfilePage(item, position)}
                >
                    <Text style={styles.headingTextStyle}>{item.name}</Text>
                    <Arrow
                        width={RFValue(15)}
                        height={RFValue(15)}
                        style={{ transform: [{ rotate: "-90deg" }] }}
                    />
                </TouchableOpacity>}
                {index == selectedIndex &&
                    <View style={{ marginTop: RFValue(10) }}>
                        {item.fields.map((item, index) => {
                            if (item.value) {
                                return (
                                    <View style={{ marginBottom: RFValue(4), flexDirection: 'row' }}>
                                        <Text
                                            kay={index.toString()}
                                            style={[styles.mainText, { color: Colors.color_gray, width: '35%' }]}
                                        >
                                            {item.title}:
                                        </Text>
                                        <Hyperlink linkDefault={true} linkStyle={{ color: Colors.color_light_blue, fontSize: RFValue(16) }}>
                                            <Text style={[styles.mainText, { color: Colors.color_black }]}>{item.value}</Text>
                                        </Hyperlink>
                                    </View>
                                )
                            }
                        })}
                    </View>
                }
                <View style={styles.sapraterView} />
            </View>
        )
    }

    const renderSubCategories = (item, index, position) => {
        return (
            <View kay={index.toString()} >
                {
                    !isEditProfile && <TouchableOpacity
                        style={styles.itemTitleContainer}
                        onPress={() => index == selectedSubIndex ? setSelectedSubIndex(null) : setSelectedSubIndex(index)}
                    >
                        <Text style={styles.headingTextStyle}>{item.name}</Text>
                        <Arrow
                            width={RFValue(15)}
                            height={RFValue(15)}
                            style={selectedSubIndex == index ? {
                                transform: [{ rotate: "180deg" }]
                            } : null}
                        />
                    </TouchableOpacity>}

                {isEditProfile && <TouchableOpacity
                    style={styles.itemTitleContainer}
                    onPress={() => gotoEditProfilePage(item, position)}
                >
                    <Text style={styles.headingTextStyle}>{item.name}</Text>
                    <Arrow
                        width={RFValue(15)}
                        height={RFValue(15)}
                        style={{ transform: [{ rotate: "-90deg" }] }}
                    />
                </TouchableOpacity>}
                {index == selectedSubIndex &&
                    <View style={{ marginTop: RFValue(10) }}>
                        {item.fields.map((item, index) => {
                            if (item.value) {
                                return (
                                    <View style={{ marginBottom: RFValue(4), flexDirection: 'row' }}>
                                        <Text
                                            kay={index.toString()}
                                            style={[styles.mainText, { color: Colors.color_gray, width: '35%' }]}
                                        >
                                            {item.title}:
                                        </Text>

                                        <Hyperlink linkDefault={true} linkStyle={{ color: Colors.color_light_blue, fontSize: RFValue(16) }}>
                                            <Text style={[styles.mainText, { color: Colors.color_black }]}>{item.value}</Text>
                                        </Hyperlink>
                                    </View>
                                )
                            }
                        })}
                    </View>
                }
                <View style={styles.sapraterView} />
            </View>
        )
    }

    return (
        <ScrollView style={styles.mainItemContainer}>
            {isEditProfile && <View>
                <TouchableOpacity
                    style={styles.itemTitleContainer}
                    onPress={() => gotoBasicDetail()}
                >
                    <Text style={styles.headingTextStyle}>{Constants.basic_details}</Text>
                    <Arrow
                        width={RFValue(15)}
                        height={RFValue(15)}
                        style={{ transform: [{ rotate: "-90deg" }] }}
                    />
                </TouchableOpacity>
                <View style={styles.sapraterView} />
            </View>}
            {category?.sections.map((item, index) => {
                let position = {
                    category: true,
                    sIndex: index
                }
                return (
                    renderSection(item, index, position)
                )
            })}
            {category?.subCategories?.map((subCategory, subCategoryIndex) => {
                return (
                    subCategory?.sections.map((item, index) => {
                        let position = {
                            category: false,
                            subCategoryIndex: subCategoryIndex,
                            sIndex: index
                        }
                        return (
                            renderSubCategories(item, index, position)
                        )
                    }))
            })}

        </ScrollView >
    )
}

const styles = StyleSheet.create({
    mainItemContainer: {
        paddingHorizontal: RFValue(15),
        paddingTop: RFValue(20),
    },
    itemTitleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    headingTextStyle: {
        fontSize: RFValue(16),
        color: Colors.color_black,
        fontFamily: Constants.font_semibold
    },
    sapraterView: {
        borderWidth: 0.5,
        marginVertical: RFValue(15),
        borderColor: Colors.color_input_border
    },
    mainText: {
        fontSize: RFValue(14),
        fontFamily: Constants.font_regular,
    }
})
