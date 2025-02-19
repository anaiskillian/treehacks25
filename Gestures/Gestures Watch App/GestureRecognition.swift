//
//  GestureRecognition.swift
//  Gestures
//
//  Created by Eric Wang on 2/15/25.
//

import Foundation
import CoreML
import CoreMotion

/// Replace gesture_classifier with your actual model class name.
class GestureRecognitionManager: ObservableObject {
    private var motionManager: CMMotionManager?
    // Shared dataBuffer accessed from the sensor callback
    private var dataBuffer: [[Double]] = []
    private let requiredSamples = 250
    private var model: gesture_classifier?

    init() {
        // Load your Core ML model.
        do {
            let config = MLModelConfiguration()
            model = try gesture_classifier(configuration: config)
        } catch {
            print("Error loading model: \(error)")
        }
        
        // Initialize the motion manager.
        initializeMotionManager()
    }
    
    /// Initializes or reinitializes the motion manager.
    private func initializeMotionManager() {
        motionManager = CMMotionManager()
        if let manager = motionManager {
            print("Motion Manager initialized.")
            print("Device Motion available: \(manager.isDeviceMotionAvailable)")
        } else {
            print("Failed to initialize Motion Manager.")
        }
    }
    
    /// Starts device motion updates to capture user acceleration and rotation rate.
    func startSensorUpdates() {
        // If motionManager is nil, reinitialize.
        if motionManager == nil {
            print("Motion Manager is nil. Reinitializing.")
            initializeMotionManager()
        }
        
        guard let motionManager = motionManager else {
            print("Motion Manager still nil after reinitialization.")
            return
        }
        
        // Check that device motion is available.
        guard motionManager.isDeviceMotionAvailable else {
            print("Device Motion not available. Please verify device capabilities and permissions.")
            return
        }
        
        // Set the update interval (for 200 Hz sampling rate).
        motionManager.deviceMotionUpdateInterval = 1.0 / 200.0
        
        let queue = OperationQueue()
        motionManager.startDeviceMotionUpdates(to: queue) { [weak self] (deviceMotion, error) in
            if let error = error {
                print("Device Motion update error: \(error)")
            }
            
            guard let self = self, let deviceMotion = deviceMotion else { return }
            
            // Create a sample vector combining user acceleration and rotation rate.
            let sample: [Double] = [
                deviceMotion.userAcceleration.x,
                deviceMotion.userAcceleration.y,
                deviceMotion.userAcceleration.z,
                deviceMotion.rotationRate.x,
                deviceMotion.rotationRate.y,
                deviceMotion.rotationRate.z
            ]
            
            // Append the new sample.
            self.dataBuffer.append(sample)
            
            // Once we have at least 250 samples, process the first 250 samples.
            if self.dataBuffer.count >= self.requiredSamples {
                // Make a local copy and clear the shared buffer to avoid race conditions.
                let samplesToProcess = Array(self.dataBuffer.prefix(self.requiredSamples))
                self.dataBuffer.removeFirst(self.requiredSamples)
                self.processDataBuffer(with: samplesToProcess)
            }
        }
    }
    
    /// Processes the buffered sensor data given a fixed array of samples.
    private func processDataBuffer(with samples: [[Double]]) {
        // Log the number of samples
        print("Processing \(samples.count) samples")
        
        // Create an MLMultiArray with 3 dimensions: [batch, time, features]
        // We use a batch size of 1.
        let batchSize = 1
        guard let mlMultiArray = try? MLMultiArray(shape: [NSNumber(value: batchSize), NSNumber(value: requiredSamples), 6], dataType: .double) else {
            print("Error creating MLMultiArray")
            return
        }
        
        // Fill the MLMultiArray.
        // Here, samples.count should be equal to requiredSamples.
        for b in 0..<batchSize {
            for i in 0..<requiredSamples {
                for j in 0..<6 {
                    // Build the index array with 3 components: batch, time, and feature.
                    let index = [NSNumber(value: b), NSNumber(value: i), NSNumber(value: j)]
                    mlMultiArray[index] = NSNumber(value: samples[i][j])
                }
            }
        }
        
        // Run the prediction.
        runPrediction(with: mlMultiArray)
    }
    
    /// Runs the Core ML prediction on the preprocessed sensor data.
    private func runPrediction(with inputArray: MLMultiArray) {
        guard let model = model else {
            print("Model is not loaded.")
            return
        }
        
        do {
            // Create the model input (make sure the property name matches your model’s interface)
            let modelInput = gesture_classifierInput(conv1d_2_input: inputArray)
            let prediction = try model.prediction(input: modelInput)
            
            // The output is an MLMultiArray of type Float16, named "identity".
            let outputArray = prediction.Identity
            
            // Determine the index to access.
            // If the shape is [1] use [0]; if it's [1,1] then use [0, 0]
            let index: [NSNumber]
            if outputArray.shape.count == 1 {
                index = [0]
            } else if outputArray.shape.count >= 2 {
                index = [0, 0]
            } else {
                index = [0]
            }
            
            // Extract the value. We assume the element can be cast to NSNumber.
            let number = outputArray[index]
            let value = number.floatValue
            
            // Use a threshold (e.g., 0.5) to determine the gesture.
            let gesture: String = (value < 0.5) ? "Thumbs Up" : "Wrist Extension"
            
            DispatchQueue.main.async {
                print("Prediction result: \(gesture) (raw value: \(value))")
                
                if (gesture == "Thumbs Up") {
                    self.sendStopSignal()
                }
            }
        } catch {
            print("Prediction error: \(error)")
        }
    }
    
    func sendStopSignal() {
        guard let url = URL(string: "http://172.20.10.3:5001/stop") else { return } // Use server's local IP
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        URLSession.shared.dataTask(with: request) { data, response, error in
            if let error = error {
                print("Error sending stop signal: \(error)")
            } else {
                print("Stop signal sent successfully")
            }
        }.resume()
    }
    
    /// Stops device motion updates.
    func stopSensorUpdates() {
        motionManager?.stopDeviceMotionUpdates()
    }
}
