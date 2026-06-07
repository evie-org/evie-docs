DOCS_CMS_DIR ?= docs-cms
DOCUCHANGO ?= docuchango
FLOWMARK ?= flowmark

# Force UTF-8 so docuchango/flowmark output does not crash on Windows consoles.
export PYTHONUTF8 := 1

.DEFAULT_GOAL := help

.PHONY: fmt validate help

# Format all Markdown in place.
fmt:
	@echo Formatting Markdown...
	@$(FLOWMARK) --auto .
	@echo Done.

# Read-only checks: formatting, document validation, and links.
validate:
	@echo Checking formatting...
	@$(FLOWMARK) --auto --check .
	@echo Validating documents...
	@cd $(DOCS_CMS_DIR) && $(DOCUCHANGO) validate
	@echo Checking links...
	@markdown-link-check -q --config markdown-link-check-config.json --ignore docs-cms/templates,.venv,docsite .
	@echo All checks passed.

help:
	@echo Kaneer Make targets:
	@echo   fmt        Format all Markdown
	@echo   validate   Check formatting, validate docs, and check links
