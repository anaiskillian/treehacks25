import SwiftUI

struct ContentView: View {
    @StateObject private var gestureManager = GestureRecognitionManager()
    
    // Function to send the /run-opencv signal
    func sendRunOpencvSignal() {
        print("here")
        guard let url = URL(string: "http://172.20.10.3:5001/run-opencv") else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                print("Error sending run opencv signal: \(error)")
            } else {
                print("Run opencv signal sent successfully")
            }
        }.resume()
        print("done")
    }
    
    var body: some View {
        ZStack {
            // Darker background to make the button stand out.
            Color.black
                .edgesIgnoringSafeArea(.all)
            
            VStack {
                Spacer()
                
                Button(action: {
                    sendRunOpencvSignal()
                }) {
                    Text("Start Camera")
                        .font(.system(size: 24, weight: .bold))
                        .lineLimit(1)
                        .minimumScaleFactor(0.5)
                        .padding()
                        .frame(maxWidth: .infinity, minHeight: 150)
                        // A custom, lighter color for the button background.
                        .background(Color(red: 0.85, green: 0.95, blue: 1.0))
                        .foregroundColor(.black)
                        .cornerRadius(15)
                        .padding(.horizontal, 16)
                }
                .buttonStyle(PlainButtonStyle())
                
                Spacer()
            }
        }
        .onAppear {
            gestureManager.startSensorUpdates()
        }
        .onDisappear {
            gestureManager.stopSensorUpdates()
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
