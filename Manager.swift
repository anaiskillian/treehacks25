import SwiftUI

struct ContentView: View {
    @StateObject private var gestureManager = GestureRecognitionManager()
    
    var body: some View {
        VStack {
            Text("Real-Time Gesture Recognition")
                .font(.headline)
                .padding()
            // You can add UI elements here to show the prediction results.
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