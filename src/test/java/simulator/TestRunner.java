package simulator;

import simulator.paging.PagingSimulatorTest;
import simulator.segmentation.SegmentationSimulatorTest;

import java.lang.reflect.Method;
import java.lang.reflect.Modifier;
import java.util.ArrayList;
import java.util.List;

/**
 * Automated Test Runner for Member 1 Core Simulation.
 *
 * Discovers and runs all unit tests, printing detailed results and summary metrics.
 * Exits with status code 0 if all tests pass, or status code 1 if any test fails.
 */
public class TestRunner {

    private static class TestResult {
        final String className;
        final String testName;
        final boolean passed;
        final String errorMessage;
        final Throwable error;

        TestResult(String className, String testName, boolean passed, String errorMessage, Throwable error) {
            this.className = className;
            this.testName = testName;
            this.passed = passed;
            this.errorMessage = errorMessage;
            this.error = error;
        }
    }

    public static void main(String[] args) {
        System.out.println("============================================================");
        System.out.println("  OS MEMORY MANAGEMENT SIMULATOR — MEMBER 1 TEST SUITE");
        System.out.println("============================================================");

        List<TestResult> results = new ArrayList<>();

        runTestSuite(PagingSimulatorTest.class, results);
        runTestSuite(SegmentationSimulatorTest.class, results);

        int total = results.size();
        int passed = 0;
        int failed = 0;

        for (TestResult r : results) {
            if (r.passed) {
                passed++;
            } else {
                failed++;
            }
        }

        System.out.println("\n============================================================");
        System.out.println("                     TEST EXECUTION SUMMARY");
        System.out.println("============================================================");
        System.out.printf(" Total Tests Executed : %d%n", total);
        System.out.printf(" Tests Passed         : %d%n", passed);
        System.out.printf(" Tests Failed         : %d%n", failed);
        System.out.println("============================================================");

        if (failed > 0) {
            System.err.println("TEST SUITE STATUS: FAILED (" + failed + " failures)");
            System.exit(1);
        } else {
            System.out.println("TEST SUITE STATUS: ALL TESTS PASSED SUCCESSFULLY! (100% PASS RATE)");
            System.exit(0);
        }
    }

    private static void runTestSuite(Class<?> testClass, List<TestResult> results) {
        System.out.println("\nRunning Test Class: " + testClass.getSimpleName());
        System.out.println("------------------------------------------------------------");

        Method[] methods = testClass.getDeclaredMethods();
        for (Method m : methods) {
            if (m.getName().startsWith("test") && Modifier.isStatic(m.getModifiers()) && m.getParameterCount() == 0) {
                try {
                    m.invoke(null);
                    System.out.printf("  [PASS] %s%n", m.getName());
                    results.add(new TestResult(testClass.getSimpleName(), m.getName(), true, null, null));
                } catch (Throwable t) {
                    Throwable cause = t.getCause() != null ? t.getCause() : t;
                    System.err.printf("  [FAIL] %s - %s%n", m.getName(), cause.getMessage());
                    results.add(new TestResult(testClass.getSimpleName(), m.getName(), false, cause.getMessage(), cause));
                }
            }
        }
    }
}
