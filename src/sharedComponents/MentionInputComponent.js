import * as React from 'react';
import { useState } from 'react';
import { MentionInput } from 'react-native-controlled-mentions';
import {
    Pressable,
    SafeAreaView,
    Text,
    View,
    KeyboardAvoidingView,
    Platform,
    Dimensions,
    ScrollView,
    TextInput
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import * as ApiManager from '../apiManager/ApiManager';


const MentionInputComponent = (props) => {

    const suggestions = [
        {id: '1', name: 'David Tabaka'},
        {id: '2', name: 'Mary'},
        {id: '3', name: 'Tony'},
        {id: '4', name: 'Mike'},
        {id: '5', name: 'Grey'},
      ];

      const renderSuggestions = ({keyword, onSuggestionPress}) => {
        if (keyword == null) {
          return null;
        }
      
        return (
          <View>
            {suggestions
              .filter(one => one.name.toLocaleLowerCase().includes(keyword.toLocaleLowerCase()))
              .map(one => (
                <Pressable
                  key={one.id}
                  onPress={() => onSuggestionPress(one)}
      
                  style={{padding: 12}}
                >
                  <Text>{one.name}</Text>
                </Pressable>
              ))
            }
          </View>
        );
      };

    const changeText = (text) => {
        setValue(text)
        props.onReviewTextChange(text);
        // do API call of tag names
        // @....
        

    }

    const [value, setValue] = useState('');
    const [tagData, setTagData] = useState('');

    return (
        <KeyboardAvoidingView
            enabled={Platform.OS === 'ios'}
            behavior="padding"
            style={{ flex: 1, justifyContent: 'flex-end' }}>
            <SafeAreaView>

                <MentionInput
                    autoFocus
                    onChange={(text) => changeText(text)}
                    style={props.style}
                    partTypes={[
                        {
                          trigger: '@', // Should be a single character like '@' or '#'
                          renderSuggestions,
                          textStyle: {fontWeight: 'bold', color: 'blue'}, // The mention style in the input
                        },
                      ]}
                    placeholder={props.placeholder}
                    multiline={true}
                />
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
};

export default MentionInputComponent;
