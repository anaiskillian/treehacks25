import Foundation
import CoreML
import CoreMotion
import Accelerate

// MARK: - Biquad Filter Section

/// A biquad filter section implementing:
/// y[n] = b0*x[n] + b1*x[n-1] + b2*x[n-2] - a1*y[n-1] - a2*y[n-2]
struct Biquad {
    var b0: Double
    var b1: Double
    var b2: Double
    var a1: Double
    var a2: Double
    // Internal state
    var x1: Double = 0
    var x2: Double = 0
    var y1: Double = 0
    var y2: Double = 0
    
    mutating func process(sample: Double) -> Double {
        let y = b0 * sample + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2
        // Update the delays
        x2 = x1
        x1 = sample
        y2 = y1
        y1 = y
        return y
    }
    
    mutating func reset() {
        x1 = 0; x2 = 0; y1 = 0; y2 = 0
    }
}

// MARK: - 4th-Order Butterworth Bandpass Filter

/// A 4th-order Butterworth bandpass filter implemented as two cascaded biquad sections.
/// The filter is intended to pass frequencies between 30 and 90 Hz (for a sampling rate of 200 Hz).
struct ButterworthBandpassFilter {
    var stage1: Biquad
    var stage2: Biquad
    
    init() {
        // Placeholder coefficients for a 4th order Butterworth bandpass filter.
        // These coefficients should be computed for your desired parameters.
        // For example, using SciPy:
        //   sos = butter(4, [30/100, 90/100], btype='band', output='sos')
        // and then extracting the second-order section coefficients.
        //
        // Here we assume both stages have identical coefficients for demonstration.
        stage1 = Biquad(b0: 0.0675, b1: 0.0, b2: -0.0675,
                        a1: -1.14298, a2: 0.41280)
        stage2 = Biquad(b0: 0.0675, b1: 0.0, b2: -0.0675,
                        a1: -1.14298, a2: 0.41280)
    }
    
    /// Filters an array of signal samples.
    mutating func filter(signal: [Double]) -> [Double] {
        var output = [Double]()
        // Process each sample through the cascaded biquad sections.
        for sample in signal {
            let y1 = stage1.process(sample: sample)
            let y2 = stage2.process(sample: y1)
            output.append(y2)
        }
        return output
    }
    
    mutating func reset() {
        stage1.reset()
        stage2.reset()
    }
}

// MARK: - Gesture Recognition Manager with Filtering

/// Replace `YourModelName` with the actual class name generated from your Core ML model conversion.
class GestureRecognitionManager: ObservableObject {
    private let motionManager = CMMotionManager()
    private var dataBuffer: [[Double]] = []
    private let requiredSamples = 250
    private var model: YourModelName?
    
    init() {
        // Load your Core ML model.
        do {
            let config = MLModelConfiguration()
            model = try YourModelName(configuration: config)
        } catch {
            print("Error loading model: \(error)")
        }
    }
    
    /// Starts accelerometer and gyroscope updates.
    func startSensorUpdates() {
        guard motionManager.isAccelerometerAvailable, motionManager.isGyroAvailable else {
            print("Accelerometer or Gyroscope not available.")
            return
        }
        
        // Set the update interval (for 200 Hz sampling rate).
        motionManager.accelerometerUpdateInterval = 1.0 / 200.0
        motionManager.gyroUpdateInterval = 1.0 / 200.0
        
        // Use an OperationQueue for sensor callbacks.
        let queue = OperationQueue()
        motionManager.startAccelerometerUpdates(to: queue) { [weak self] (accelData, error) in
            guard let self = self, let accelData = accelData else { return }
            
            // For simplicity, assume the gyroscope data is synchronized.
            if let gyroData = self.motionManager.gyroData {
                // Form a sample vector with 6 features:
                // [accel.x, accel.y, accel.z, gyro.x, gyro.y, gyro.z]
                let sample: [Double] = [
                    accelData.acceleration.x,
                    accelData.acceleration.y,
                    accelData.acceleration.z,
                    gyroData.rotationRate.x,
                    gyroData.rotationRate.y,
                    gyroData.rotationRate.z
                ]
                
                self.dataBuffer.append(sample)
                
                // Once we have the required number of samples, process the buffer.
                if self.dataBuffer.count >= self.requiredSamples {
                    self.processDataBuffer()
                    self.dataBuffer.removeAll()
                }
            }
        }
    }
    
    /// Applies the Butterworth bandpass filter to the buffered data.
    /// The filtering is applied separately for each of the 6 sensor channels.
    private func applyButterworthFilter(to data: [[Double]]) -> [[Double]] {
        let sampleCount = data.count
        let channelCount = data.first?.count ?? 0
        // Prepare an array to hold filtered data.
        var filteredData = Array(repeating: [Double](repeating: 0.0, count: channelCount), count: sampleCount)
        
        // Process each channel independently.
        for channel in 0..<channelCount {
            // Extract the data for the current channel.
            let channelData = data.map { $0[channel] }
            // Initialize a fresh Butterworth filter for this channel.
            var filter = ButterworthBandpassFilter()
            let filteredChannel = filter.filter(signal: channelData)
            // Insert the filtered channel back into the overall data array.
            for i in 0..<sampleCount {
                filteredData[i][channel] = filteredChannel[i]
            }
        }
        return filteredData
    }
    
    /// Processes the buffered sensor data.
    private func processDataBuffer() {
        // First, filter the raw data.
        let filteredData = applyButterworthFilter(to: dataBuffer)
        
        // Convert the filtered 250x6 data into an MLMultiArray.
        guard let mlMultiArray = try? MLMultiArray(shape: [NSNumber(value: requiredSamples), 6], dataType: .double) else {
            print("Error creating MLMultiArray")
            return
        }
        
        // Fill the MLMultiArray.
        for i in 0..<requiredSamples {
            for j in 0..<6 {
                let index = [NSNumber(value: i), NSNumber(value: j)]
                mlMultiArray[index] = NSNumber(value: filteredData[i][j])
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
            // Adjust the input label ("input" here) based on your model's autogenerated interface.
            let prediction = try model.prediction(input: inputArray)
            
            // Process the prediction result.
            DispatchQueue.main.async {
                // Replace "classLabel" or "output" with the actual output property from your model.
                print("Prediction result: \(prediction)")
                // Update your UI or take action based on the prediction.
            }
        } catch {
            print("Prediction error: \(error)")
        }
    }
    
    /// Stops sensor updates.
    func stopSensorUpdates() {
        motionManager.stopAccelerometerUpdates()
        motionManager.stopGyroUpdates()
    }
}