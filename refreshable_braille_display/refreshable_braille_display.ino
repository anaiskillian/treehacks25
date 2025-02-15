/*

The objective of this program is to take a string and represent it
using the braille display one letter at a time.

The braille alphabet uses characters with six dots
in three rows and two columns. the dots are labeled 1-6
as follows:

  1  4
  2  5
  3  6

*/

// store the code for each letter a-z in a 2D array
int braille[26][6] = {
  {1,0,0,0,0,0},  // a (first bump is raised, others are lowered)
  {1,1,0,0,0,0},  // b (first and second bumps are raised)
  {1,0,0,1,0,0},  // c (and so on...)
  {1,0,0,1,1,0},  // d
  {1,0,0,0,1,0},  // e
  {1,1,0,1,0,0},  // f
  {1,1,0,1,1,0},  // g
  {1,1,0,0,1,0},  // h
  {0,1,0,1,0,0},  // i
  {0,1,0,1,1,0},  // j
  {1,0,1,0,0,0},  // k
  {1,1,1,0,0,0},  // l
  {1,0,1,1,0,0},  // m
  {1,0,1,1,1,0},  // n
  {1,0,1,0,1,0},  // o
  {1,1,1,1,0,0},  // p
  {1,1,1,1,1,0},  // q
  {1,1,1,0,1,0},  // r
  {0,1,1,1,0,0},  // s
  {0,1,1,1,1,0},  // t
  {1,0,1,0,0,1},  // u
  {1,1,1,0,0,1},  // v
  {0,1,0,1,1,1},  // w
  {1,0,1,1,0,1},  // x
  {1,0,1,1,1,1},  // y
  {1,0,1,0,1,1},  // z
};

// array of the Arduino pins used to control the solenoids
int controlPins[6] = {4,2,3,5,6,7};

// pin for the button
int buttonPin = 8;

// array for the alphabet
char alphabet[] = "abcdefghijklmnopqrstuvwxyz";

// string to convert to braille
String text = "abcdz";

// variable for getting the individual letter of the text[] array
char letter;

// variable for finding the index of letter in alphabet
int index;

// length of the text[] array (I this adds one because of the weird zero padding thing?)
int length = text.length();

int getIndex(char letter) {
  return letter - 'a'; // Converts 'a' -> 0, 'b' -> 1, ..., 'z' -> 25
}

void setup() {
  Serial.begin(9600); // Start serial communication
  for(int i = 0; i < 6; i++){
    pinMode(controlPins[i], OUTPUT);
  }
  pinMode(buttonPin, INPUT);
}

void displayText(String text) {
  for (int i = 0; i < text.length(); i++) {
    char letter = text[i];
    int index = getIndex(letter);
    Serial.print("Displaying: ");
    Serial.println(letter);

    for(int k = 0; k < 6; k++){
      digitalWrite(controlPins[k], braille[index][k]); 
    }
    delay(1000);  // Wait 1 second before moving to next letter
  }
  Serial.println("Done"); // Signal to Python that display is complete
}

void loop() {
  if (Serial.available() > 0) { // Check if Python sent data
    String receivedText = Serial.readStringUntil('\n'); // Read input string
    receivedText.trim(); // Remove unwanted newline characters
    Serial.print("Received: ");
    Serial.println(receivedText);
    displayText(receivedText); // Call displayText function
  }
}
