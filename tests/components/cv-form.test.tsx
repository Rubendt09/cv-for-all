/**
 * Component tests for the CV form.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CvForm } from "@/components/Form/CvForm";
import { useCvStore } from "@/store/cvStore";
import exampleYaml from "@/examples/example-cv.yaml?raw";

function resetStore(yaml: string) {
  useCvStore.setState({
    yamlString: yaml,
    errors: [],
    isValid: false,
    externalYamlRevision: useCvStore.getState().externalYamlRevision + 1,
  });
}

describe("CvForm", () => {
  beforeEach(() => {
    resetStore(exampleYaml);
  });

  it("renders the header card with the CV name", () => {
    const result = render(<CvForm />);
    // The BasicsCard is open by default and shows the name field
    expect(screen.getByDisplayValue("John Doe")).toBeTruthy();
    result.unmount();
  });

  it("updates yamlString when the name is edited", () => {
    const result = render(<CvForm />);
    const input = screen.getByDisplayValue("John Doe") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "Jane Doe" } });
    // The store should have been updated
    expect(useCvStore.getState().yamlString).toContain("Jane Doe");
    result.unmount();
  });

  it("shows a banner for invalid YAML instead of the form", () => {
    resetStore("cv:\n  name: John\n  bad: : :");
    const result = render(<CvForm />);
    expect(screen.getByText(/Switch to YAML editor/i)).toBeTruthy();
    result.unmount();
  });

  it("renders sections from the example", () => {
    const result = render(<CvForm />);
    // Sections card is open by default; section titles should appear
    expect(screen.getByText("Summary")).toBeTruthy();
    expect(screen.getByText("Experience")).toBeTruthy();
    expect(screen.getByText("Education")).toBeTruthy();
    result.unmount();
  });
});
